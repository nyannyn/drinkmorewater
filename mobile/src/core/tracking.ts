// 追蹤邏輯（手機）：純運算委派給跨平台共用的 ../../../shared/tracking.js，
// 此層只負責讀寫 AsyncStorage。桌面版（electron）使用同一份 shared 邏輯。
import { loadData, saveData } from "./storage";
import { AppData, DayLog } from "./types";
import * as core from "../../../shared/tracking.js";

// 跨日重設（含每週記錄）
export async function resetDailyIfNeeded(): Promise<AppData> {
  const data = await loadData();
  const next = core.resetDailyIfNeeded(data);
  return next === data ? data : saveData(next);
}

// 記錄喝水
export async function handleDrinkComplete(ml?: number): Promise<AppData> {
  const data = await loadData();
  return saveData(core.applyDrink(data, ml));
}

// 取得含今日的 7 天統計
export async function getWeeklyStats(): Promise<{ log: DayLog[]; dailyGoalMl: number }> {
  const data = await loadData();
  return core.getWeeklyStats(data);
}

export async function resetData(): Promise<AppData> {
  const data = await loadData();
  return saveData(core.resetTracking(data));
}
