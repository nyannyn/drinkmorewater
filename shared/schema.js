// 共用資料 schema —— 桌面版 (electron/) 與手機版 (mobile/) 的單一真相來源。
// 以 CommonJS + JSDoc 撰寫：桌面 require()、手機 metro / node:test 皆可直接使用，免 build step。

/**
 * @typedef {Object} DayLog
 * @property {string} date  new Date().toDateString()
 * @property {number} ml
 * @property {number} cups
 */

/**
 * @typedef {Object} AppData
 * @property {number} todayMl       本機今日累計毫升（同步時視為「本機貢獻」）
 * @property {number} todayCups     本機今日杯數
 * @property {string|null} lastDate 上次記錄日期 toDateString()
 * @property {DayLog[]} weeklyLog   近 7 日（不含今日）記錄
 * @property {number} dailyGoalMl   每日目標
 * @property {number} intervalMin   提醒間隔（分）
 * @property {boolean} enabled      是否啟用提醒
 * @property {number} drinkMl       每次記錄水量
 * @property {boolean} soundEnabled
 * @property {string} [activeStart] 活躍時段起 "HH:MM"（手機特有）
 * @property {string} [activeEnd]   活躍時段迄 "HH:MM"（手機特有）
 * @property {string} lang
 */

const DRINK_ML = 300;
const DEFAULT_INTERVAL_MIN = 30;
const DEFAULT_DAILY_GOAL_ML = 2000;

/** @type {AppData} */
const DEFAULTS = {
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

const INTERVAL_OPTIONS = [15, 30, 45, 60];
const DRINK_OPTIONS = [150, 200, 250, 300, 500];

// 會參與「設定」同步（last-write-wins）的欄位。追蹤類欄位走加總，不在此列。
const SETTINGS_KEYS = [
  "dailyGoalMl",
  "intervalMin",
  "enabled",
  "drinkMl",
  "soundEnabled",
  "activeStart",
  "activeEnd",
  "lang",
];

module.exports = {
  DRINK_ML,
  DEFAULT_INTERVAL_MIN,
  DEFAULT_DAILY_GOAL_ML,
  DEFAULTS,
  INTERVAL_OPTIONS,
  DRINK_OPTIONS,
  SETTINGS_KEYS,
};
