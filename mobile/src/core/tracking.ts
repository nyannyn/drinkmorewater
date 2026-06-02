import { loadData, saveData } from "./storage";
import { AppData, DayLog } from "./types";

// 跨日重設（含每週記錄）—— 移植自 electron/main.js resetDailyIfNeeded()
export async function resetDailyIfNeeded(): Promise<AppData> {
  const data = await loadData();
  const today = new Date().toDateString();
  if (data.lastDate !== today) {
    const log: DayLog[] = [...(data.weeklyLog ?? [])];
    if (data.lastDate) {
      log.push({ date: data.lastDate, ml: data.todayMl ?? 0, cups: data.todayCups ?? 0 });
      while (log.length > 7) log.shift();
    }
    return saveData({ lastDate: today, todayMl: 0, todayCups: 0, weeklyLog: log });
  }
  return data;
}

// 記錄喝水 —— 移植自 handleDrinkComplete()
export async function handleDrinkComplete(ml?: number): Promise<AppData> {
  const data = await resetDailyIfNeeded();
  const addMl = ml ?? data.drinkMl;
  return saveData({
    todayMl: data.todayMl + addMl,
    todayCups: data.todayCups + 1,
  });
}

// 取得含今日的 7 天統計 —— 移植自 getWeeklyStats()
export async function getWeeklyStats(): Promise<{ log: DayLog[]; dailyGoalMl: number }> {
  const data = await resetDailyIfNeeded();
  const today: DayLog = {
    date: data.lastDate ?? new Date().toDateString(),
    ml: data.todayMl,
    cups: data.todayCups,
  };
  return { log: [...data.weeklyLog, today], dailyGoalMl: data.dailyGoalMl };
}

export async function resetData(): Promise<AppData> {
  return saveData({
    todayMl: 0,
    todayCups: 0,
    weeklyLog: [],
    lastDate: new Date().toDateString(),
  });
}
