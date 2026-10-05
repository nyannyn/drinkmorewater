import type { AppData } from "./types.ts";
import { DEFAULTS } from "./types.ts";

// App Store 截圖用的示範資料（只在 EXPO_PUBLIC_SCREENSHOT=1 的 CI build 寫入，正式 build 不會呼叫）。
// 今日 1500 / 2000 ml（75%），過去 6 天有高有低、三天達標（2100/2000/2300），讓週圖看得出綠色達標條。
const PAST_SIX_DAYS_ML = [1800, 2100, 900, 2000, 1500, 2300];

export function buildDemoData(today: string = new Date().toDateString()): AppData {
  const end = new Date(today);
  const weeklyLog = PAST_SIX_DAYS_ML.map((ml, i) => {
    const d = new Date(end);
    d.setDate(end.getDate() - (PAST_SIX_DAYS_ML.length - i));
    return { date: d.toDateString(), ml, cups: Math.round(ml / DEFAULTS.drinkMl) };
  });
  return {
    ...DEFAULTS,
    lastDate: today,
    todayMl: 1500,
    todayCups: 5,
    dailyGoalMl: 2000,
    weeklyLog,
  };
}
