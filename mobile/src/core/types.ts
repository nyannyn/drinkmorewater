// 飲水資料 schema —— 常數與預設值改由跨平台共用的 ../../../shared/schema.js 提供，
// 桌面與手機共用同一份真相來源；此處僅保留 TypeScript 介面型別供前端使用。
import * as schema from "../../../shared/schema.js";

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

export const DRINK_ML: number = schema.DRINK_ML;
export const DEFAULT_INTERVAL_MIN: number = schema.DEFAULT_INTERVAL_MIN;
export const DEFAULT_DAILY_GOAL_ML: number = schema.DEFAULT_DAILY_GOAL_ML;
export const DEFAULTS: AppData = schema.DEFAULTS as AppData;
export const INTERVAL_OPTIONS: number[] = schema.INTERVAL_OPTIONS;
export const DRINK_OPTIONS: number[] = schema.DRINK_OPTIONS;
export const SETTINGS_KEYS: string[] = schema.SETTINGS_KEYS;
