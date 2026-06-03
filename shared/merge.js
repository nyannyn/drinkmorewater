// 共用同步合併邏輯 —— 純函式，桌面 / 手機 / 伺服器三方共用，可完整單元測試。
//
// 核心模型（避免多裝置離線記錄時重複計數或掉資料）：
//   每台裝置只保存「自己的」每日貢獻 ownContrib[date] = {ml, cups}。
//   推送時送出 ownContrib；伺服器把同帳號各裝置「依日期加總」。
//   裝置收回完整加總 aggregate 後，算出 othersContrib = aggregate - own，
//   顯示用的數值 = own + others。單機未同步時 others 為空，行為與原本完全一致。
//   設定（間隔/目標…）不加總，改用時間戳 last-write-wins。

/** @typedef {import('./schema').AppData} AppData */
/** @typedef {import('./schema').DayLog} DayLog */
/** @typedef {Record<string, {ml:number, cups:number}>} ContribMap  date -> {ml,cups} */

const { SETTINGS_KEYS } = require("./schema");

/** 由現有 AppData 推導出本機的每日貢獻表（首次啟用同步時的遷移）。 */
function contribFromAppData(data) {
  /** @type {ContribMap} */
  const map = {};
  for (const d of data.weeklyLog ?? []) {
    map[d.date] = { ml: d.ml ?? 0, cups: d.cups ?? 0 };
  }
  if (data.lastDate) {
    map[data.lastDate] = { ml: data.todayMl ?? 0, cups: data.todayCups ?? 0 };
  }
  return map;
}

/** 在貢獻表上加一次喝水（回傳新表，不改輸入）。 */
function addContribution(own, date, ml, cups) {
  const cur = own[date] ?? { ml: 0, cups: 0 };
  return { ...own, [date]: { ml: cur.ml + ml, cups: cur.cups + (cups ?? 1) } };
}

/** 伺服器側：把多裝置的 rows 依日期加總。rows: {date, ml, cups}[] */
function aggregateRows(rows) {
  /** @type {ContribMap} */
  const agg = {};
  for (const r of rows) {
    const cur = agg[r.date] ?? { ml: 0, cups: 0 };
    agg[r.date] = { ml: cur.ml + (r.ml ?? 0), cups: cur.cups + (r.cups ?? 0) };
  }
  return agg;
}

/** 由完整加總與本機貢獻，算出「其他裝置」的貢獻（夾住不為負）。 */
function computeOthers(aggregate, own) {
  /** @type {ContribMap} */
  const others = {};
  for (const date of Object.keys(aggregate)) {
    const a = aggregate[date];
    const o = own[date] ?? { ml: 0, cups: 0 };
    others[date] = { ml: Math.max(0, a.ml - o.ml), cups: Math.max(0, a.cups - o.cups) };
  }
  return others;
}

/** 兩張貢獻表逐日相加（顯示用 = own + others）。 */
function sumContrib(a, b) {
  /** @type {ContribMap} */
  const out = {};
  for (const date of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[date] ?? { ml: 0, cups: 0 };
    const y = b[date] ?? { ml: 0, cups: 0 };
    out[date] = { ml: x.ml + y.ml, cups: x.cups + y.cups };
  }
  return out;
}

/**
 * 把貢獻表攤平成 AppData 的追蹤欄位（todayMl/todayCups/weeklyLog/lastDate）。
 * 今日進 today 欄位，其餘進 weeklyLog（依日期升冪、最多 7 筆）。
 * @param {ContribMap} contrib
 * @param {string} today
 * @returns {{todayMl:number, todayCups:number, weeklyLog:DayLog[], lastDate:string}}
 */
function contribToTracking(contrib, today) {
  const todayCell = contrib[today] ?? { ml: 0, cups: 0 };
  const past = Object.keys(contrib)
    .filter((d) => d !== today)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((d) => ({ date: d, ml: contrib[d].ml, cups: contrib[d].cups }));
  while (past.length > 7) past.shift();
  return { todayMl: todayCell.ml, todayCups: todayCell.cups, weeklyLog: past, lastDate: today };
}

/** 抽出 AppData 中參與同步的設定子集。 */
function pickSettings(data) {
  const out = {};
  for (const k of SETTINGS_KEYS) if (data[k] !== undefined) out[k] = data[k];
  return out;
}

/**
 * 設定的 last-write-wins：時間戳較新者勝。回傳 {settings, updatedAt, changed}。
 * changed 表示「對方較新、本機應套用」。
 */
function mergeSettings(local, localTs, remote, remoteTs) {
  if (remote && (remoteTs ?? 0) > (localTs ?? 0)) {
    return { settings: { ...remote }, updatedAt: remoteTs, changed: true };
  }
  return { settings: { ...local }, updatedAt: localTs ?? 0, changed: false };
}

module.exports = {
  contribFromAppData,
  addContribution,
  aggregateRows,
  computeOthers,
  sumContrib,
  contribToTracking,
  pickSettings,
  mergeSettings,
};
