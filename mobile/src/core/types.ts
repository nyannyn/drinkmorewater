// 飲水資料 schema —— 沿用桌面版 (electron/store.js) 的鍵名，方便日後跨平台同步。

export interface DayLog {
  date: string; // new Date().toDateString()
  ml: number;
  cups: number;
}

export interface AppData {
  // 追蹤
  todayMl: number;
  todayCups: number;
  lastDate: string | null;
  weeklyLog: DayLog[];
  dailyGoalMl: number;
  // 設定
  intervalMin: number; // 提醒間隔（分）
  enabled: boolean; // 是否啟用提醒
  drinkMl: number; // 每次記錄的水量
  soundEnabled: boolean;
  // 手機特有：活躍時段（此區間外不發提醒，取代桌面的鎖屏/閒置暫停）
  activeStart: string; // "HH:MM"
  activeEnd: string; // "HH:MM"
  lang: string;
}

export const DRINK_ML = 300;
export const DEFAULT_INTERVAL_MIN = 30;
export const DEFAULT_DAILY_GOAL_ML = 2000;

export const DEFAULTS: AppData = {
  todayMl: 0,
  todayCups: 0,
  lastDate: null,
  weeklyLog: [],
  dailyGoalMl: DEFAULT_DAILY_GOAL_ML,
  intervalMin: DEFAULT_INTERVAL_MIN,
  enabled: true,
  drinkMl: DRINK_ML,
  soundEnabled: true,
  activeStart: "08:00",
  activeEnd: "22:00",
  lang: "zh-Hant",
};

export const INTERVAL_OPTIONS = [15, 30, 45, 60];
