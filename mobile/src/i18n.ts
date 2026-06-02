// 極簡多語字串表（預設繁中，沿用桌面版語氣）。
const STRINGS = {
  "zh-Hant": {
    appTitle: "喝水提醒",
    today: "今日",
    cups: "杯",
    goal: "每日目標",
    drink: "喝一杯",
    home: "首頁",
    settings: "設定",
    interval: "提醒間隔",
    minutes: "分鐘",
    enabled: "啟用提醒",
    activeWindow: "活躍時段",
    activeHint: "此時段外不發提醒（取代鎖屏暫停）",
    dailyGoal: "每日目標 (ml)",
    sound: "通知音效",
    weekly: "過去 7 天",
    reset: "重置資料",
    resetConfirm: "確定要清除所有飲水資料嗎？",
    cancel: "取消",
    confirm: "確定",
    scheduled: (n: number) => `已排定 ${n} 則提醒`,
    permDenied: "未取得通知權限，請到「設定 → 通知」開啟。",
    goalReached: "今日目標達成！🎉",
  },
};

export type Lang = keyof typeof STRINGS;
export function t(lang: string) {
  return STRINGS[(lang as Lang)] ?? STRINGS["zh-Hant"];
}
