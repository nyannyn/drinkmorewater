// 多語字串表（沿用桌面版 renderer/settings.js 的語氣與語言集）。
// 支援 4 語：繁中 / 簡中 / 英 / 日。預設繁中。
//
// 注意：通知文字（notifyTitle/notifyBody/drankAction）也納入此表，
// 讓 src/notifications/notify.ts 依使用者語言排程本地化通知。

export interface Strings {
  appTitle: string;
  today: string;
  cups: string;
  drink: string;
  home: string;
  settings: string;
  interval: string;
  minutes: string;
  enabled: string;
  activeWindow: string;
  activeHint: string;
  dailyGoal: string;
  drinkAmount: string;
  sound: string;
  language: string;
  testNotif: string;
  weekly: string;
  reset: string;
  resetConfirm: string;
  cancel: string;
  confirm: string;
  scheduled: (n: number) => string;
  permDenied: string;
  goalReached: string;
  // 跨裝置同步
  sync: string;
  syncDesc: string;
  syncServerUrl: string;
  syncCreate: string;
  syncJoin: string;
  syncCodeHint: string;
  syncCodePlaceholder: string;
  syncLinked: string;
  syncUnlink: string;
  syncNow: string;
  syncFail: string;
  // 通知
  notifyTitle: string;
  notifyBody: string;
  drankAction: string;
  // 週圖星期縮寫（index 0 = 週日，對齊 Date.getDay()）
  days: [string, string, string, string, string, string, string];
}

const STRINGS: Record<string, Strings> = {
  "zh-Hant": {
    appTitle: "喝水提醒",
    today: "今日",
    cups: "杯",
    drink: "喝一杯",
    home: "首頁",
    settings: "設定",
    interval: "提醒間隔",
    minutes: "分鐘",
    enabled: "啟用提醒",
    activeWindow: "活躍時段",
    activeHint: "此時段外不發提醒（取代鎖屏暫停）",
    dailyGoal: "每日目標 (ml)",
    drinkAmount: "每次飲水量 (ml)",
    sound: "通知音效",
    language: "語言",
    testNotif: "傳送測試通知",
    weekly: "過去 7 天",
    reset: "重置資料",
    resetConfirm: "確定要清除所有飲水資料嗎？",
    cancel: "取消",
    confirm: "確定",
    scheduled: (n) => `已排定 ${n} 則提醒`,
    permDenied: "未取得通知權限，請到「設定 → 通知」開啟。",
    goalReached: "今日目標達成！🎉",
    sync: "跨裝置同步",
    syncDesc: "與桌面版／其他手機共享飲水紀錄。",
    syncServerUrl: "伺服器網址",
    syncCreate: "產生配對碼",
    syncJoin: "用配對碼加入",
    syncCodeHint: "在另一台裝置輸入此碼（10 分鐘內有效）",
    syncCodePlaceholder: "6 位配對碼",
    syncLinked: "已連動",
    syncUnlink: "解除連動",
    syncNow: "立即同步",
    syncFail: "同步失敗，請確認網址與配對碼",
    notifyTitle: "💧 該喝水了！",
    notifyBody: "你已經很久沒喝水了，記得補充水分哦！",
    drankAction: "我喝了 💧",
    days: ["日", "一", "二", "三", "四", "五", "六"],
  },
  "zh-Hans": {
    appTitle: "喝水提醒",
    today: "今日",
    cups: "杯",
    drink: "喝一杯",
    home: "首页",
    settings: "设置",
    interval: "提醒间隔",
    minutes: "分钟",
    enabled: "启用提醒",
    activeWindow: "活跃时段",
    activeHint: "此时段外不发提醒（取代锁屏暂停）",
    dailyGoal: "每日目标 (ml)",
    drinkAmount: "每次饮水量 (ml)",
    sound: "通知音效",
    language: "语言",
    testNotif: "发送测试通知",
    weekly: "过去 7 天",
    reset: "重置数据",
    resetConfirm: "确定要清除所有饮水数据吗？",
    cancel: "取消",
    confirm: "确定",
    scheduled: (n) => `已排定 ${n} 则提醒`,
    permDenied: "未取得通知权限，请到「设置 → 通知」开启。",
    goalReached: "今日目标达成！🎉",
    sync: "跨设备同步",
    syncDesc: "与桌面版／其他手机共享饮水记录。",
    syncServerUrl: "服务器网址",
    syncCreate: "生成配对码",
    syncJoin: "用配对码加入",
    syncCodeHint: "在另一台设备输入此码（10 分钟内有效）",
    syncCodePlaceholder: "6 位配对码",
    syncLinked: "已连动",
    syncUnlink: "解除连动",
    syncNow: "立即同步",
    syncFail: "同步失败，请确认网址与配对码",
    notifyTitle: "💧 该喝水了！",
    notifyBody: "你已经很久没喝水了，记得补充水分哦！",
    drankAction: "我喝了 💧",
    days: ["日", "一", "二", "三", "四", "五", "六"],
  },
  en: {
    appTitle: "Drink Water",
    today: "Today",
    cups: "cups",
    drink: "Drink",
    home: "Home",
    settings: "Settings",
    interval: "Interval",
    minutes: "min",
    enabled: "Reminders",
    activeWindow: "Active hours",
    activeHint: "No reminders outside this window (replaces lock-screen pause).",
    dailyGoal: "Daily goal (ml)",
    drinkAmount: "Drink amount (ml)",
    sound: "Notification sound",
    language: "Language",
    testNotif: "Send test notification",
    weekly: "Last 7 days",
    reset: "Reset data",
    resetConfirm: "Clear all hydration data?",
    cancel: "Cancel",
    confirm: "OK",
    scheduled: (n) => `${n} reminders scheduled`,
    permDenied: "Notifications not allowed. Enable them in Settings → Notifications.",
    goalReached: "Daily goal reached! 🎉",
    sync: "Cross-device sync",
    syncDesc: "Share hydration data with desktop / other phones.",
    syncServerUrl: "Server URL",
    syncCreate: "Create pairing code",
    syncJoin: "Join with code",
    syncCodeHint: "Enter this code on the other device (valid 10 min)",
    syncCodePlaceholder: "6-digit code",
    syncLinked: "Linked",
    syncUnlink: "Unlink",
    syncNow: "Sync now",
    syncFail: "Sync failed — check the URL and code",
    notifyTitle: "💧 Time to drink!",
    notifyBody: "You haven't had water in a while — stay hydrated!",
    drankAction: "I drank 💧",
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  ja: {
    appTitle: "水飲みリマインダー",
    today: "本日",
    cups: "杯",
    drink: "飲む",
    home: "ホーム",
    settings: "設定",
    interval: "間隔",
    minutes: "分",
    enabled: "リマインダー",
    activeWindow: "アクティブ時間帯",
    activeHint: "この時間帯外は通知しません（ロック中の一時停止の代替）。",
    dailyGoal: "1日の目標 (ml)",
    drinkAmount: "1回の量 (ml)",
    sound: "通知音",
    language: "言語",
    testNotif: "テスト通知を送信",
    weekly: "過去 7 日間",
    reset: "リセット",
    resetConfirm: "すべての記録を消去しますか？",
    cancel: "キャンセル",
    confirm: "OK",
    scheduled: (n) => `${n} 件の通知を予約しました`,
    permDenied: "通知が許可されていません。「設定 → 通知」で有効にしてください。",
    goalReached: "目標達成！🎉",
    sync: "デバイス間同期",
    syncDesc: "デスクトップ版／他のスマホと記録を共有します。",
    syncServerUrl: "サーバー URL",
    syncCreate: "ペアリングコード発行",
    syncJoin: "コードで参加",
    syncCodeHint: "別のデバイスでこのコードを入力（10 分間有効）",
    syncCodePlaceholder: "6 桁のコード",
    syncLinked: "連携済み",
    syncUnlink: "連携解除",
    syncNow: "今すぐ同期",
    syncFail: "同期に失敗しました。URL とコードを確認してください",
    notifyTitle: "💧 水を飲む時間です！",
    notifyBody: "しばらく水を飲んでいません。水分補給を忘れずに！",
    drankAction: "飲んだ 💧",
    days: ["日", "月", "火", "水", "木", "金", "土"],
  },
};

// 語言選單（設定頁切換用）。
export const LANGUAGES: { code: string; label: string }[] = [
  { code: "zh-Hant", label: "繁中" },
  { code: "zh-Hans", label: "简中" },
  { code: "en", label: "EN" },
  { code: "ja", label: "日本語" },
];

export type Lang = keyof typeof STRINGS;

export function t(lang: string): Strings {
  return STRINGS[lang as Lang] ?? STRINGS["zh-Hant"];
}
