// 共用追蹤邏輯 —— 純函式，不碰 I/O。桌面與手機各自以自家儲存層包裝後呼叫。
// 原邏輯散見 electron/main.js 與 mobile/src/core/tracking.ts，此處合一。

/** @typedef {import('./schema').AppData} AppData */
/** @typedef {import('./schema').DayLog} DayLog */

/** 取得「今天」字串；可注入以利測試。 */
function todayStr(now = new Date()) {
  return now.toDateString();
}

/**
 * 跨日重設：若 lastDate 不是今天，把昨日數據收進 weeklyLog（保留 7 筆）並歸零。
 * 回傳新的 data（不修改輸入）。
 * @param {AppData} data
 * @param {string} [today]
 * @returns {AppData}
 */
function resetDailyIfNeeded(data, today = todayStr()) {
  if (data.lastDate === today) return data;
  const log = [...(data.weeklyLog ?? [])];
  if (data.lastDate) {
    log.push({ date: data.lastDate, ml: data.todayMl ?? 0, cups: data.todayCups ?? 0 });
    while (log.length > 7) log.shift();
  }
  return { ...data, lastDate: today, todayMl: 0, todayCups: 0, weeklyLog: log };
}

/**
 * 記錄一次喝水：先跨日重設，再加上水量與杯數。
 * @param {AppData} data
 * @param {number} [ml]  省略則用 data.drinkMl
 * @param {string} [today]
 * @returns {AppData}
 */
function applyDrink(data, ml, today = todayStr()) {
  const d = resetDailyIfNeeded(data, today);
  const addMl = ml ?? d.drinkMl;
  return { ...d, todayMl: d.todayMl + addMl, todayCups: d.todayCups + 1 };
}

/**
 * 取得含今日的 7 天統計（給週圖用）。
 * @param {AppData} data
 * @param {string} [today]
 * @returns {{ log: DayLog[], dailyGoalMl: number }}
 */
function getWeeklyStats(data, today = todayStr()) {
  const d = resetDailyIfNeeded(data, today);
  const todayLog = { date: d.lastDate ?? today, ml: d.todayMl, cups: d.todayCups };
  return { log: [...d.weeklyLog, todayLog], dailyGoalMl: d.dailyGoalMl };
}

/**
 * 清空所有追蹤數據（保留設定）。
 * @param {AppData} data
 * @param {string} [today]
 * @returns {AppData}
 */
function resetTracking(data, today = todayStr()) {
  return { ...data, todayMl: 0, todayCups: 0, weeklyLog: [], lastDate: today };
}

module.exports = { todayStr, resetDailyIfNeeded, applyDrink, getWeeklyStats, resetTracking };
