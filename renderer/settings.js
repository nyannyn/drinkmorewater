// ===== i18n =====
const I18N = {
  "zh-Hant": {
    tabMain: "統計",
    tabPrefs: "偏好設定",
    title: "喝水提醒",
    subToday: (cups) => `今日已喝 ${cups} 次`,
    goalLabel: (goal, pct) => `目標 ${goal} ml (${pct}%)`,
    weeklyTitle: "過去 7 天",
    labelInterval: "提醒間隔",
    labelGoal: "每日目標 (ml)",
    labelEnabled: "定時提醒",
    enabledNote: "關閉後不會出現水杯與橫幅通知。",
    labelSound: "音效回饋",
    labelVolume: "音量",
    drinkBtn: (ml) => `+${ml} ml`,
    testBtn: "立即測試",
    exportBtn: "匯出資料",
    resetBtn: "重置紀錄",
    resetTodayBtn: "重置今日",
    resetConfirm: "確定要重置所有飲水紀錄嗎？此操作無法復原。",
    resetTodayConfirm: "確定要重置今日飲水紀錄嗎？",
    noData: "尚無歷史資料",
    days: ["日", "一", "二", "三", "四", "五", "六"],
    prefThemeTitle: "介面風格",
    prefLangTitle: "語言",
    prefGeneralTitle: "一般",
    prefCupTitle: "水杯樣式",
    cupStyleNote: "下次提醒時會以新樣式顯示，按「立即測試」可立刻預覽。",
    cupClassic: "毛玻璃杯",
    cupMug: "馬克杯",
    cupBoba: "珍奶杯",
    cupFlask: "燒瓶",
    cupBottle: "運動水壺",
    themeDefault: "黏土風",
    themeDark: "深色",
    themeFlat: "扁平",
    themePlayful: "活潑",
    themeMono: "單色",
    labelLang: "顯示語言",
    labelAutoStart: "開機自動啟動",
    autoStartNote: "開啟後，電腦開機時自動在背景啟動提醒。",
    labelDrinkMl: "每次飲水量 (ml)",
    drinkMlNote: "每次長按水杯記錄的毫升數。",
    labelHoldSpeed: "長按速度",
    holdSpeedNote: "倍率越高，長按喝水越快完成。",
    labelBanner: "橫幅通知",
    intervalOpts: ["15 分鐘", "30 分鐘", "45 分鐘", "60 分鐘"],
    cancel: "取消",
    confirmOk: "確定重置",
    goalDone: "🎉 今日目標達成！",
    prefSyncTitle: "跨裝置同步",
    syncDesc: "與手機版／其他電腦共享飲水紀錄。",
    labelSyncServer: "伺服器網址",
    syncCreate: "產生配對碼",
    syncJoin: "加入",
    syncLinkedLabel: "✓ 已連動",
    syncCodeHint: "在另一台裝置輸入此碼（10 分鐘內有效）",
    syncNow: "立即同步",
    syncUnlink: "解除連動",
    syncError: "同步失敗，請確認網址與配對碼",
    prefAboutTitle: "關於與隱私",
    privacyText: "所有飲水紀錄與設定僅儲存於本機，不含任何追蹤、分析或遙測。除非你主動啟用「跨裝置同步」並自行架設伺服器，否則本程式不會進行任何網路連線。原始碼完全公開，歡迎檢視。",
    feedbackBug: "回報問題",
    feedbackWish: "功能許願",    sourceCode: "原始碼",  },
  "zh-Hans": {
    tabMain: "统计",
    tabPrefs: "偏好设置",
    title: "喝水提醒",
    subToday: (cups) => `今日已喝 ${cups} 次`,
    goalLabel: (goal, pct) => `目标 ${goal} ml (${pct}%)`,
    weeklyTitle: "过去 7 天",
    labelInterval: "提醒间隔",
    labelGoal: "每日目标 (ml)",
    labelEnabled: "定时提醒",
    enabledNote: "关闭后不会出现水杯与横幅通知。",
    labelSound: "音效反馈",
    labelVolume: "音量",
    drinkBtn: (ml) => `+${ml} ml`,
    testBtn: "立即测试",
    exportBtn: "导出数据",
    resetBtn: "重置记录",
    resetTodayBtn: "重置今日",
    resetConfirm: "确定要重置所有饮水记录吗？此操作无法恢复。",
    resetTodayConfirm: "确定要重置今日饮水记录吗？",
    noData: "暂无历史数据",
    days: ["日", "一", "二", "三", "四", "五", "六"],
    prefThemeTitle: "界面风格",
    prefLangTitle: "语言",
    prefGeneralTitle: "一般",
    prefCupTitle: "水杯样式",
    cupStyleNote: "下次提醒时会以新样式显示，按「立即测试」可立刻预览。",
    cupClassic: "毛玻璃杯",
    cupMug: "马克杯",
    cupBoba: "珍奶杯",
    cupFlask: "烧瓶",
    cupBottle: "运动水壶",
    themeDefault: "黏土风",
    themeDark: "深色",
    themeFlat: "扁平",
    themePlayful: "活泼",
    themeMono: "单色",
    labelLang: "显示语言",
    labelAutoStart: "开机自动启动",
    autoStartNote: "开启后，电脑开机时自动在背景启动提醒。",
    labelDrinkMl: "每次饮水量 (ml)",
    drinkMlNote: "每次长按水杯记录的毫升数。",
    labelHoldSpeed: "长按速度",
    holdSpeedNote: "倍率越高，长按喝水越快完成。",
    labelBanner: "横幅通知",
    intervalOpts: ["15 分钟", "30 分钟", "45 分钟", "60 分钟"],
    cancel: "取消",
    confirmOk: "确定重置",
    goalDone: "🎉 今日目标达成！",
    prefSyncTitle: "跨设备同步",
    syncDesc: "与手机版／其他电脑共享饮水记录。",
    labelSyncServer: "服务器网址",
    syncCreate: "生成配对码",
    syncJoin: "加入",
    syncLinkedLabel: "✓ 已连动",
    syncCodeHint: "在另一台设备输入此码（10 分钟内有效）",
    syncNow: "立即同步",
    syncUnlink: "解除连动",
    syncError: "同步失败，请确认网址与配对码",
    prefAboutTitle: "关于与隐私",
    privacyText: "所有饮水记录与设置仅存储于本机，不含任何追踪、分析或遥测。除非你主动启用「跨设备同步」并自行架设服务器，否则本程序不会进行任何网络连接。源代码完全公开，欢迎查阅。",
    feedbackBug: "报告问题",
    feedbackWish: "功能许愿",
    sourceCode: "源代码",
  },
  en: {
    tabMain: "Stats",
    tabPrefs: "Preferences",
    title: "Drink Water",
    subToday: (cups) => `${cups} drinks today`,
    goalLabel: (goal, pct) => `Goal ${goal} ml (${pct}%)`,
    weeklyTitle: "Last 7 Days",
    labelInterval: "Interval",
    labelGoal: "Daily goal (ml)",
    labelEnabled: "Reminders",
    enabledNote: "When off, no cup or banner notification will appear.",
    labelSound: "Sound",
    labelVolume: "Volume",
    drinkBtn: (ml) => `+${ml} ml`,
    testBtn: "Test now",
    exportBtn: "Export",
    resetBtn: "Reset",
    resetTodayBtn: "Reset Today",
    resetConfirm: "Are you sure you want to reset all records? This cannot be undone.",
    resetTodayConfirm: "Reset today's record?",
    noData: "No data yet",
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    prefThemeTitle: "THEME",
    prefLangTitle: "LANGUAGE",
    prefGeneralTitle: "GENERAL",
    prefCupTitle: "CUP STYLE",
    cupStyleNote: "Applied at the next reminder. Tap “Test now” to preview immediately.",
    cupClassic: "Glass",
    cupMug: "Mug",
    cupBoba: "Boba",
    cupFlask: "Flask",
    cupBottle: "Bottle",
    themeDefault: "Clay",
    themeDark: "Dark",
    themeFlat: "Flat",
    themePlayful: "Playful",
    themeMono: "Mono",
    labelLang: "Language",
    labelAutoStart: "Launch on startup",
    autoStartNote: "Start the reminder when your computer boots.",
    labelDrinkMl: "Drink amount (ml)",
    drinkMlNote: "Milliliters recorded per drink action.",
    labelHoldSpeed: "Hold speed",
    holdSpeedNote: "Higher = faster to complete a long-press drink.",
    labelBanner: "Banner notification",
    intervalOpts: ["15 min", "30 min", "45 min", "60 min"],
    cancel: "Cancel",
    confirmOk: "Reset",
    goalDone: "🎉 Daily goal reached!",
    prefSyncTitle: "CROSS-DEVICE SYNC",
    syncDesc: "Share hydration data with the mobile app / other computers.",
    labelSyncServer: "Server URL",
    syncCreate: "Create pairing code",
    syncJoin: "Join",
    syncLinkedLabel: "✓ Linked",
    syncCodeHint: "Enter this code on the other device (valid 10 min)",
    syncNow: "Sync now",
    syncUnlink: "Unlink",
    syncError: "Sync failed — check the URL and code",
    prefAboutTitle: "ABOUT & PRIVACY",
    privacyText: "All hydration data and settings are stored locally on your device. This app contains no tracking, analytics, or telemetry. No network requests are made unless you enable Cross-device Sync with your own server. The source code is fully open for inspection.",
    feedbackBug: "Report a bug",
    feedbackWish: "Request a feature",
    sourceCode: "Source code",
  },
  ja: {
    tabMain: "統計",
    tabPrefs: "設定",
    title: "水飲みリマインダー",
    subToday: (cups) => `本日 ${cups} 回`,
    goalLabel: (goal, pct) => `目標 ${goal} ml (${pct}%)`,
    weeklyTitle: "過去 7 日間",
    labelInterval: "間隔",
    labelGoal: "1日の目標 (ml)",
    labelEnabled: "リマインダー",
    enabledNote: "オフにするとコップもバナー通知も表示されません。",
    labelSound: "サウンド",
    labelVolume: "音量",
    drinkBtn: (ml) => `+${ml} ml`,
    testBtn: "テスト",
    exportBtn: "出力",
    resetBtn: "リセット",
    resetTodayBtn: "今日をリセット",
    resetConfirm: "すべての記録をリセットしますか？元に戻せません。",
    resetTodayConfirm: "今日の記録をリセットしますか？",
    noData: "データなし",
    days: ["日", "月", "火", "水", "木", "金", "土"],
    prefThemeTitle: "テーマ",
    prefLangTitle: "言語",
    prefGeneralTitle: "一般",
    prefCupTitle: "コップのスタイル",
    cupStyleNote: "次回のリマインドから反映されます。「テスト」で今すぐ確認できます。",
    cupClassic: "グラス",
    cupMug: "マグカップ",
    cupBoba: "タピオカ",
    cupFlask: "フラスコ",
    cupBottle: "ボトル",
    themeDefault: "クレイ",
    themeDark: "ダーク",
    themeFlat: "フラット",
    themePlayful: "ポップ",
    themeMono: "モノ",
    labelLang: "言語",
    labelAutoStart: "自動起動",
    autoStartNote: "PC起動時にバックグラウンドで起動します。",
    labelDrinkMl: "1回の量 (ml)",
    drinkMlNote: "1回あたりの記録量。",
    labelHoldSpeed: "長押し速度",
    holdSpeedNote: "倍率が高いほど長押しが早く完了します。",
    labelBanner: "バナー通知",
    intervalOpts: ["15 分", "30 分", "45 分", "60 分"],
    cancel: "キャンセル",
    confirmOk: "リセット",
    goalDone: "🎉 目標達成！",
    prefSyncTitle: "デバイス間同期",
    syncDesc: "スマホ版／他のPCと記録を共有します。",
    labelSyncServer: "サーバー URL",
    syncCreate: "ペアリングコード発行",
    syncJoin: "参加",
    syncLinkedLabel: "✓ 連携済み",
    syncCodeHint: "別のデバイスでこのコードを入力（10 分間有効）",
    syncNow: "今すぐ同期",
    syncUnlink: "連携解除",
    syncError: "同期に失敗しました。URL とコードを確認してください",
    prefAboutTitle: "このアプリについて",
    privacyText: "すべての記録と設定はお使いの端末にのみ保存されます。トラッキング・分析・テレメトリは一切含まれていません。「デバイス間同期」を有効にし自分のサーバーを指定しない限り、通信は行われません。ソースコードはすべて公開されています。",
    feedbackBug: "不具合を報告",
    feedbackWish: "機能リクエスト",
    sourceCode: "ソースコード",
  },
};

let currentLang = "zh-Hant";
let currentDrinkMl = 300;

function t(key) {
  return I18N[currentLang]?.[key] ?? I18N["zh-Hant"][key] ?? key;
}

// ===== DOM refs =====
const $todayMl = document.getElementById("todayMl");
const $intervalMin = document.getElementById("intervalMin");
const $enabledToggle = document.getElementById("enabledToggle");
const $goalBar = document.getElementById("goalBar");
const $goalBadge = document.getElementById("goalBadge");
const $dailyGoal = document.getElementById("dailyGoal");
const $weeklyChart = document.getElementById("weeklyChart");
const $soundToggle = document.getElementById("soundToggle");
const $volumeSlider = document.getElementById("volumeSlider");
const $volumeLabel = document.getElementById("volumeLabel");
const $volumeRow = document.getElementById("volumeRow");
const $langSelect = document.getElementById("langSelect");
const $autoStartToggle = document.getElementById("autoStartToggle");
const $drinkMl = document.getElementById("drinkMl");
const $drinkBtn = document.getElementById("drinkBtn");
const $holdSpeedSlider = document.getElementById("holdSpeedSlider");
const $holdSpeedLabel = document.getElementById("holdSpeedLabel");
const $bannerToggle = document.getElementById("bannerToggle");

// ===== Toggle helper =====
function setToggle(el, on) {
  el.classList.toggle("on", on);
  el.setAttribute("aria-checked", on ? "true" : "false");
}

function bindToggle(el, initialState, onChange) {
  setToggle(el, initialState);
  const fire = () => {
    const next = !el.classList.contains("on");
    setToggle(el, next);
    onChange(next);
  };
  el.addEventListener("click", fire);
  el.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      fire();
    }
  });
}

// ===== Tabs =====
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
  });
});

// ===== Theme =====
function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  document.querySelectorAll(".theme-card[data-theme]").forEach((card) => {
    card.classList.toggle("selected", card.dataset.theme === theme);
  });
}

document.querySelectorAll(".theme-card[data-theme]").forEach((card) => {
  card.addEventListener("click", () => {
    const theme = card.dataset.theme;
    applyTheme(theme);
    window.api.setPrefs({ theme });
  });
});

// ===== Cup style =====
const cupLabels = {
  classic: "cupClassic",
  mug: "cupMug",
  boba: "cupBoba",
  flask: "cupFlask",
  bottle: "cupBottle",
};

function renderCupStyleCards() {
  const grid = document.getElementById("cupStyleGrid");
  if (!grid || !window.CUP_STYLE_ORDER) return;
  grid.innerHTML = "";
  window.CUP_STYLE_ORDER.forEach((id) => {
    const style = window.CUP_STYLES[id];
    if (!style) return;
    const card = document.createElement("div");
    card.className = "theme-card cup-card";
    card.dataset.cup = id;
    card.innerHTML = `
      <div class="preview">
        <svg viewBox="${style.viewBox}" xmlns="http://www.w3.org/2000/svg">${style.svg}</svg>
      </div>
      <span data-cup-label="${id}"></span>
    `;
    card.addEventListener("click", () => applyCupStyle(id, true));
    grid.appendChild(card);
  });
}

function applyCupStyle(id, save = false) {
  document.querySelectorAll(".cup-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.cup === id);
  });
  if (save) window.api.setPrefs({ cupStyle: id });
}

function applyCupStyleLabels() {
  document.querySelectorAll("[data-cup-label]").forEach((el) => {
    const key = cupLabels[el.dataset.cupLabel];
    if (key) el.textContent = t(key);
  });
}

// ===== i18n apply =====
function applyLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  document.getElementById("tabMain").textContent = t("tabMain");
  document.getElementById("tabPrefs").textContent = t("tabPrefs");
  document.getElementById("titleMain").textContent = t("title");
  document.getElementById("weeklyTitle").textContent = t("weeklyTitle");
  document.getElementById("labelInterval").textContent = t("labelInterval");
  document.getElementById("labelGoal").textContent = t("labelGoal");
  document.getElementById("labelEnabled").textContent = t("labelEnabled");
  document.getElementById("enabledNote").textContent = t("enabledNote");
  document.getElementById("labelBanner").textContent = t("labelBanner");
  document.getElementById("labelSound").textContent = t("labelSound");
  document.getElementById("labelVolume").textContent = t("labelVolume");
  $drinkBtn.textContent = t("drinkBtn")(currentDrinkMl);
  document.getElementById("testBtn").textContent = t("testBtn");
  document.getElementById("exportBtn").textContent = t("exportBtn");
  document.getElementById("resetTodayBtn").textContent = t("resetTodayBtn");
  document.getElementById("resetBtn").textContent = t("resetBtn");

  document.getElementById("prefThemeTitle").textContent = t("prefThemeTitle");
  document.getElementById("prefLangTitle").textContent = t("prefLangTitle");
  document.getElementById("prefGeneralTitle").textContent = t("prefGeneralTitle");
  document.getElementById("prefCupTitle").textContent = t("prefCupTitle");
  document.getElementById("cupStyleNote").textContent = t("cupStyleNote");
  applyCupStyleLabels();
  document.getElementById("themeDefaultLabel").textContent = t("themeDefault");
  document.getElementById("themeDarkLabel").textContent = t("themeDark");
  document.getElementById("themeFlatLabel").textContent = t("themeFlat");
  document.getElementById("themePlayfulLabel").textContent = t("themePlayful");
  document.getElementById("themeMonoLabel").textContent = t("themeMono");
  document.getElementById("labelLang").textContent = t("labelLang");
  document.getElementById("labelAutoStart").textContent = t("labelAutoStart");
  document.getElementById("autoStartNote").textContent = t("autoStartNote");
  document.getElementById("labelDrinkMl").textContent = t("labelDrinkMl");
  document.getElementById("drinkMlNote").textContent = t("drinkMlNote");
  document.getElementById("labelHoldSpeed").textContent = t("labelHoldSpeed");
  document.getElementById("holdSpeedNote").textContent = t("holdSpeedNote");

  document.getElementById("prefSyncTitle").textContent = t("prefSyncTitle");
  document.getElementById("syncDesc").textContent = t("syncDesc");
  document.getElementById("labelSyncServer").textContent = t("labelSyncServer");
  document.getElementById("syncCreateBtn").textContent = t("syncCreate");
  document.getElementById("syncCreateBtn2").textContent = "+ " + t("syncCreate");
  document.getElementById("syncJoinBtn").textContent = t("syncJoin");
  document.getElementById("syncLinkedLabel").textContent = t("syncLinkedLabel");
  document.getElementById("syncCodeHint").textContent = t("syncCodeHint");
  document.getElementById("syncNowBtn").textContent = t("syncNow");
  document.getElementById("syncUnlinkBtn").textContent = t("syncUnlink");

  document.getElementById("prefAboutTitle").textContent = t("prefAboutTitle");
  document.getElementById("privacyText").textContent = t("privacyText");
  document.getElementById("feedbackBugLabel").textContent = t("feedbackBug");
  document.getElementById("feedbackWishLabel").textContent = t("feedbackWish");
  document.getElementById("sourceCodeLabel").textContent = t("sourceCode");

  const opts = t("intervalOpts");
  $intervalMin.querySelectorAll("option").forEach((opt, i) => { opt.textContent = opts[i]; });
}

$langSelect.addEventListener("change", () => {
  const lang = $langSelect.value;
  applyLang(lang);
  window.api.setPrefs({ lang });
  refresh();
});

// ===== Feedback buttons =====
document.getElementById("feedbackBugBtn").addEventListener("click", () => {
  window.api.openExternal("https://github.com/nyannyn/drinkmorewater/issues/new?template=bug_report.yml");
});
document.getElementById("feedbackWishBtn").addEventListener("click", () => {
  window.api.openExternal("https://github.com/nyannyn/drinkmorewater/issues/new?template=feature_request.yml");
});
document.getElementById("sourceCodeBtn").addEventListener("click", () => {
  window.api.openExternal("https://github.com/nyannyn/drinkmorewater");
});

// ===== Auto start =====
bindToggle($autoStartToggle, false, (on) => {
  window.api.setPrefs({ autoStart: on });
});

// ===== Drink ml =====
function clampInt(raw, min, max, fallback, step) {
  let v = parseInt(raw, 10);
  if (Number.isNaN(v)) v = fallback;
  if (step) v = Math.round(v / step) * step;
  return Math.min(max, Math.max(min, v));
}

$drinkMl.addEventListener("change", () => {
  const val = clampInt($drinkMl.value, 50, 1000, currentDrinkMl, 50);
  $drinkMl.value = val;
  currentDrinkMl = val;
  $drinkBtn.textContent = t("drinkBtn")(val);
  window.api.setPrefs({ drinkMl: val });
});

$holdSpeedSlider.addEventListener("input", () => {
  $holdSpeedLabel.textContent = $holdSpeedSlider.value + "x";
});
$holdSpeedSlider.addEventListener("change", () => {
  const speed = parseFloat($holdSpeedSlider.value);
  $holdSpeedLabel.textContent = speed + "x";
  window.api.setPrefs({ holdSpeed: speed });
});

// ===== Drink button =====
$drinkBtn.addEventListener("click", () => {
  window.api.drinkNow(currentDrinkMl);
});

// ===== Data loading =====
async function loadStatus() {
  const res = await window.api.getStatus();
  if (!res) return;
  $todayMl.textContent = res.todayMl;
  document.getElementById("subToday").textContent = t("subToday")(res.todayCups);
  $intervalMin.value = res.intervalMin;

  // Sync toggles
  setToggle($enabledToggle, !!res.enabled);
  setToggle($soundToggle, !!res.soundEnabled);

  $dailyGoal.value = res.dailyGoalMl;
  $volumeSlider.value = res.soundVolume;
  $volumeLabel.textContent = res.soundVolume + "%";
  $volumeRow.style.display = res.soundEnabled ? "" : "none";

  const goal = res.dailyGoalMl || 2000;
  const rawPct = (res.todayMl / goal) * 100;
  const pct = Math.min(Math.round(rawPct), 100);
  $goalBar.style.width = pct + "%";
  document.getElementById("goalLabelWrap").textContent = t("goalLabel")(goal, pct);

  // 達標慶祝（B2）
  const reached = res.todayMl >= goal;
  const card = $goalBadge.closest(".card");
  if (card) card.classList.toggle("goal-reached", reached);
  $goalBar.classList.toggle("full", reached);
  $goalBadge.textContent = reached ? t("goalDone") : "";
}

async function loadWeeklyStats() {
  const res = await window.api.getWeeklyStats();
  if (!res) return;
  renderWeeklyChart(res.log, res.dailyGoalMl);
}

function renderWeeklyChart(log, goalMl) {
  $weeklyChart.innerHTML = "";
  if (!log || log.length === 0) {
    $weeklyChart.innerHTML =
      '<div style="font-size:11px;color:var(--text-sub);text-align:center;width:100%">' + t("noData") + "</div>";
    return;
  }

  const days = t("days");
  // 「過去 7 天」：最多取最近 7 筆（含今日），對齊標題文案
  const recent = log.slice(-7);
  const maxMl = Math.max(goalMl, ...recent.map((d) => d.ml), 1);

  recent.forEach((entry) => {
    const d = new Date(entry.date);
    const dayName = days[d.getDay()];
    const barH = Math.max((entry.ml / maxMl) * 50, 2);
    const reached = entry.ml >= goalMl;

    const col = document.createElement("div");
    col.className = "bar-col";

    const mlLabel = document.createElement("div");
    mlLabel.className = "bar-ml";
    mlLabel.textContent = entry.ml > 0 ? entry.ml : "";

    const barWrap = document.createElement("div");
    barWrap.className = "bar-wrap";

    const bar = document.createElement("div");
    bar.className = "bar" + (reached ? " reached" : "");
    bar.style.height = barH + "px";

    barWrap.appendChild(bar);

    const dayLabel = document.createElement("div");
    dayLabel.className = "bar-day";
    dayLabel.textContent = dayName;

    col.appendChild(mlLabel);
    col.appendChild(barWrap);
    col.appendChild(dayLabel);

    $weeklyChart.appendChild(col);
  });
}

async function loadPrefs() {
  const prefs = await window.api.getPrefs();
  if (!prefs) return;

  applyTheme(prefs.theme || "default");
  applyCupStyle(prefs.cupStyle || "classic");
  $langSelect.value = prefs.lang || "zh-Hant";
  applyLang(prefs.lang || "zh-Hant");

  setToggle($autoStartToggle, !!prefs.autoStart);

  currentDrinkMl = prefs.drinkMl || 300;
  $drinkMl.value = currentDrinkMl;
  $drinkBtn.textContent = t("drinkBtn")(currentDrinkMl);

  const speed = prefs.holdSpeed || 1;
  $holdSpeedSlider.value = speed;
  $holdSpeedLabel.textContent = speed + "x";

  setToggle($bannerToggle, prefs.bannerEnabled !== false);
}

async function refresh() {
  await Promise.all([loadStatus(), loadWeeklyStats()]);
}

// ===== Init =====
renderCupStyleCards();
loadPrefs()
  .then(() => refresh())
  .catch((e) => console.error(e))
  .finally(() => document.body.classList.remove("preload"));

window.api.onStatusChanged(() => refresh());

// ===== Event listeners =====
$intervalMin.addEventListener("change", () => {
  window.api.setSettings({ intervalMin: parseFloat($intervalMin.value) });
});

bindToggle($enabledToggle, true, () => {
  window.api.toggleEnabled();
});

bindToggle($bannerToggle, true, (on) => {
  window.api.setPrefs({ bannerEnabled: on });
});

$dailyGoal.addEventListener("change", () => {
  const val = clampInt($dailyGoal.value, 500, 5000, 2000, 100);
  $dailyGoal.value = val;
  window.api.setDailyGoal(val);
  loadStatus();
});

bindToggle($soundToggle, false, (on) => {
  $volumeRow.style.display = on ? "" : "none";
  window.api.setSoundSettings(on, parseInt($volumeSlider.value, 10));
});

$volumeSlider.addEventListener("input", () => {
  $volumeLabel.textContent = $volumeSlider.value + "%";
});

$volumeSlider.addEventListener("change", () => {
  window.api.setSoundSettings($soundToggle.classList.contains("on"), parseInt($volumeSlider.value, 10));
});

document.getElementById("testBtn").addEventListener("click", () => {
  window.api.testReminder();
});

document.getElementById("exportBtn").addEventListener("click", async () => {
  await window.api.exportData();
});

// ===== 主題化確認對話框（取代原生 confirm） =====
const $confirmModal = document.getElementById("confirmModal");
const $confirmMsg = document.getElementById("confirmMsg");
const $confirmOk = document.getElementById("confirmOk");
const $confirmCancel = document.getElementById("confirmCancel");

function showConfirm(message) {
  return new Promise((resolve) => {
    $confirmMsg.textContent = message;
    $confirmOk.textContent = t("confirmOk");
    $confirmCancel.textContent = t("cancel");
    $confirmModal.classList.add("show");
    $confirmOk.focus();

    const cleanup = (result) => {
      $confirmModal.classList.remove("show");
      $confirmOk.removeEventListener("click", onOk);
      $confirmCancel.removeEventListener("click", onCancel);
      $confirmModal.removeEventListener("click", onOverlay);
      document.removeEventListener("keydown", onKey);
      resolve(result);
    };
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    const onOverlay = (e) => { if (e.target === $confirmModal) cleanup(false); };
    const onKey = (e) => { if (e.key === "Escape") cleanup(false); };

    $confirmOk.addEventListener("click", onOk);
    $confirmCancel.addEventListener("click", onCancel);
    $confirmModal.addEventListener("click", onOverlay);
    document.addEventListener("keydown", onKey);
  });
}

document.getElementById("resetTodayBtn").addEventListener("click", async () => {
  if (!(await showConfirm(t("resetTodayConfirm")))) return;
  await window.api.resetToday();
  refresh();
});

document.getElementById("resetBtn").addEventListener("click", async () => {
  if (!(await showConfirm(t("resetConfirm")))) return;
  await window.api.resetData();
  refresh();
});

// ===== 跨裝置同步 =====
const $syncServerUrl = document.getElementById("syncServerUrl");
const $syncCodeInput = document.getElementById("syncCodeInput");
const $syncError = document.getElementById("syncError");
const $syncCodeBox = document.getElementById("syncCodeBox");
const $syncIssuedCode = document.getElementById("syncIssuedCode");

function setSyncView(linked) {
  document.getElementById("syncUnlinkedView").style.display = linked ? "none" : "flex";
  document.getElementById("syncLinkedView").style.display = linked ? "flex" : "none";
  if (!linked) $syncCodeBox.style.display = "none";
}

function showSyncError(msg) {
  $syncError.textContent = msg || t("syncError");
  $syncError.style.display = msg === "" ? "none" : "block";
}

async function loadSyncStatus() {
  const st = await window.api.syncStatus();
  if (!st) return;
  if (st.serverUrl) $syncServerUrl.value = st.serverUrl;
  setSyncView(!!st.linked);
}

document.getElementById("syncCreateBtn").addEventListener("click", createCode);
document.getElementById("syncCreateBtn2").addEventListener("click", createCode);
async function createCode() {
  showSyncError("");
  const url = $syncServerUrl.value.trim();
  if (!url) return showSyncError();
  const res = await window.api.syncCreateCode(url);
  if (!res || !res.ok) return showSyncError();
  $syncIssuedCode.textContent = res.code;
  $syncCodeBox.style.display = "block";
  setSyncView(true);
  refresh();
}

document.getElementById("syncJoinBtn").addEventListener("click", async () => {
  showSyncError("");
  const url = $syncServerUrl.value.trim();
  const code = $syncCodeInput.value.trim();
  if (!url || !code) return showSyncError();
  const res = await window.api.syncClaimCode(url, code);
  if (!res || !res.ok) return showSyncError();
  $syncCodeInput.value = "";
  setSyncView(true);
  refresh();
});

document.getElementById("syncNowBtn").addEventListener("click", async () => {
  showSyncError("");
  const res = await window.api.syncNow();
  if (!res || !res.ok) return showSyncError();
  refresh();
});

document.getElementById("syncUnlinkBtn").addEventListener("click", async () => {
  await window.api.syncUnlink();
  setSyncView(false);
  refresh();
});

loadSyncStatus();
