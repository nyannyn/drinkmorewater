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
    labelEnabled: "提醒通知",
    labelSound: "音效回饋",
    labelVolume: "音量",
    drinkBtn: (ml) => `+${ml} ml`,
    testBtn: "立即測試",
    exportBtn: "匯出資料",
    resetBtn: "重置紀錄",
    resetConfirm: "確定要重置所有飲水紀錄嗎？此操作無法復原。",
    noData: "尚無歷史資料",
    days: ["日", "一", "二", "三", "四", "五", "六"],
    prefThemeTitle: "介面風格",
    prefLangTitle: "語言",
    prefGeneralTitle: "一般",
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
    intervalOpts: ["15 分鐘", "30 分鐘", "45 分鐘", "60 分鐘"],
  },
  "zh-Hans": {
    tabMain: "统计",
    tabPrefs: "偏好设置",
    title: "喝水提醒",
    subToday: (cups) => `今日已喝 ${cups} 次`,
    goalLabel: (goal, pct) => `目标 ${goal} ml (${pct}%)`,
    weeklyTitle: "过去 7 天",
    labelInterval: "提醒间隔",
    labelGoal: "每日目标 (ml)",
    labelEnabled: "提醒通知",
    labelSound: "音效回馈",
    labelVolume: "音量",
    drinkBtn: (ml) => `+${ml} ml`,
    testBtn: "立即测试",
    exportBtn: "导出数据",
    resetBtn: "重置记录",
    resetConfirm: "确定要重置所有饮水记录吗？此操作无法撤销。",
    noData: "暂无历史数据",
    days: ["日", "一", "二", "三", "四", "五", "六"],
    prefThemeTitle: "界面风格",
    prefLangTitle: "语言",
    prefGeneralTitle: "一般",
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
    intervalOpts: ["15 分钟", "30 分钟", "45 分钟", "60 分钟"],
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
    labelEnabled: "Notifications",
    labelSound: "Sound",
    labelVolume: "Volume",
    drinkBtn: (ml) => `+${ml} ml`,
    testBtn: "Test now",
    exportBtn: "Export",
    resetBtn: "Reset",
    resetConfirm: "Are you sure you want to reset all records? This cannot be undone.",
    noData: "No data yet",
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    prefThemeTitle: "THEME",
    prefLangTitle: "LANGUAGE",
    prefGeneralTitle: "GENERAL",
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
    intervalOpts: ["15 min", "30 min", "45 min", "60 min"],
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
    labelEnabled: "通知",
    labelSound: "サウンド",
    labelVolume: "音量",
    drinkBtn: (ml) => `+${ml} ml`,
    testBtn: "テスト",
    exportBtn: "出力",
    resetBtn: "リセット",
    resetConfirm: "すべての記録をリセットしますか？元に戻せません。",
    noData: "データなし",
    days: ["日", "月", "火", "水", "木", "金", "土"],
    prefThemeTitle: "テーマ",
    prefLangTitle: "言語",
    prefGeneralTitle: "一般",
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
    intervalOpts: ["15 分", "30 分", "45 分", "60 分"],
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

// ===== Toggle helper =====
function bindToggle(el, initialState, onChange) {
  if (initialState) el.classList.add("on");
  else el.classList.remove("on");
  el.addEventListener("click", () => {
    el.classList.toggle("on");
    onChange(el.classList.contains("on"));
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
  document.querySelectorAll(".theme-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.theme === theme);
  });
}

document.querySelectorAll(".theme-card").forEach((card) => {
  card.addEventListener("click", () => {
    const theme = card.dataset.theme;
    applyTheme(theme);
    window.api.setPrefs({ theme });
  });
});

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
  document.getElementById("labelSound").textContent = t("labelSound");
  document.getElementById("labelVolume").textContent = t("labelVolume");
  $drinkBtn.textContent = t("drinkBtn")(currentDrinkMl);
  document.getElementById("testBtn").textContent = t("testBtn");
  document.getElementById("exportBtn").textContent = t("exportBtn");
  document.getElementById("resetBtn").textContent = t("resetBtn");

  document.getElementById("prefThemeTitle").textContent = t("prefThemeTitle");
  document.getElementById("prefLangTitle").textContent = t("prefLangTitle");
  document.getElementById("prefGeneralTitle").textContent = t("prefGeneralTitle");
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

  const opts = t("intervalOpts");
  $intervalMin.querySelectorAll("option").forEach((opt, i) => { opt.textContent = opts[i]; });
}

$langSelect.addEventListener("change", () => {
  const lang = $langSelect.value;
  applyLang(lang);
  window.api.setPrefs({ lang });
  refresh();
});

// ===== Auto start =====
bindToggle($autoStartToggle, false, (on) => {
  window.api.setPrefs({ autoStart: on });
});

// ===== Drink ml =====
$drinkMl.addEventListener("change", () => {
  const val = parseInt($drinkMl.value, 10);
  if (val >= 50 && val <= 1000) {
    currentDrinkMl = val;
    $drinkBtn.textContent = t("drinkBtn")(val);
    window.api.setPrefs({ drinkMl: val });
  }
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
  if (res.enabled) $enabledToggle.classList.add("on");
  else $enabledToggle.classList.remove("on");
  if (res.soundEnabled) $soundToggle.classList.add("on");
  else $soundToggle.classList.remove("on");

  $dailyGoal.value = res.dailyGoalMl;
  $volumeSlider.value = res.soundVolume;
  $volumeLabel.textContent = res.soundVolume + "%";
  $volumeRow.style.display = res.soundEnabled ? "" : "none";

  const goal = res.dailyGoalMl || 2000;
  const pct = Math.min(Math.round((res.todayMl / goal) * 100), 100);
  $goalBar.style.width = pct + "%";
  document.getElementById("goalLabelWrap").textContent = t("goalLabel")(goal, pct);
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
  const maxMl = Math.max(goalMl, ...log.map((d) => d.ml), 1);

  log.forEach((entry) => {
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
  $langSelect.value = prefs.lang || "zh-Hant";
  applyLang(prefs.lang || "zh-Hant");

  if (prefs.autoStart) $autoStartToggle.classList.add("on");
  else $autoStartToggle.classList.remove("on");

  currentDrinkMl = prefs.drinkMl || 300;
  $drinkMl.value = currentDrinkMl;
  $drinkBtn.textContent = t("drinkBtn")(currentDrinkMl);
}

function refresh() {
  loadStatus();
  loadWeeklyStats();
}

// ===== Init =====
loadPrefs().then(() => refresh());

window.api.onStatusChanged(() => refresh());

// ===== Event listeners =====
$intervalMin.addEventListener("change", () => {
  window.api.setSettings({ intervalMin: parseFloat($intervalMin.value) });
});

bindToggle($enabledToggle, true, () => {
  window.api.toggleEnabled();
});

$dailyGoal.addEventListener("change", () => {
  const val = parseInt($dailyGoal.value, 10);
  if (val >= 500 && val <= 5000) {
    window.api.setDailyGoal(val);
    loadStatus();
  }
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

document.getElementById("resetBtn").addEventListener("click", async () => {
  if (!confirm(t("resetConfirm"))) return;
  await window.api.resetData();
  refresh();
});
