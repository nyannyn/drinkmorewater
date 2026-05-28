const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  Notification,
  dialog,
  screen,
  powerMonitor,
  nativeImage,
} = require("electron");
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");
const store = require("./store");

// ===== 常數 =====
const DEFAULT_INTERVAL_MIN = 30;
const DRINK_ML = 300;
const DEFAULT_DAILY_GOAL_ML = 2000;
const IDLE_AWAY_SEC = 5 * 60; // 離開超過 5 分鐘視為不在位，略過該次提醒

const ICON_PATH = path.join(__dirname, "..", "build", "icon.png");

let tray = null;
let cupWindow = null;
let settingsWindow = null;
let reminderTimer = null;
let paused = false; // 鎖屏 / 睡眠時暫停

// ===== 單一實例 =====
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => openSettings());
}

// ===== 跨日重設（含每週記錄）— 移植自 background.js =====
function resetDailyIfNeeded() {
  const today = new Date().toDateString();
  const data = store.get(["lastDate", "todayMl", "todayCups", "weeklyLog"]);
  if (data.lastDate !== today) {
    const log = data.weeklyLog ?? [];
    if (data.lastDate) {
      log.push({
        date: data.lastDate,
        ml: data.todayMl ?? 0,
        cups: data.todayCups ?? 0,
      });
      while (log.length > 7) log.shift();
    }
    store.set({ lastDate: today, todayMl: 0, todayCups: 0, weeklyLog: log });
  }
}

// ===== 提醒計時器（取代 chrome.alarms） =====
function clearReminderTimer() {
  if (reminderTimer) {
    clearTimeout(reminderTimer);
    reminderTimer = null;
  }
}

function scheduleReminder() {
  clearReminderTimer();
  const { intervalMin = DEFAULT_INTERVAL_MIN, enabled = true } = store.get([
    "intervalMin",
    "enabled",
  ]);
  if (!enabled || paused) return;
  reminderTimer = setTimeout(() => {
    fireReminder();
  }, (intervalMin ?? DEFAULT_INTERVAL_MIN) * 60 * 1000);
}

function fireReminder() {
  resetDailyIfNeeded();
  // 使用者離開過久就略過這次（回來後下一輪會再提醒）
  if (powerMonitor.getSystemIdleTime() < IDLE_AWAY_SEC) {
    triggerCup();
  }
  scheduleReminder(); // 排下一次
}

// 顯示水杯 + 系統通知
function triggerCup() {
  if (!cupWindow) createCupWindow();
  positionCupWindow();
  cupWindow.showInactive(); // 不搶焦點
  cupWindow.setIgnoreMouseEvents(false);
  const { cupStyle = "classic" } = store.get(["cupStyle"]);
  cupWindow.webContents.send("reminder", { cupStyle });

  if (Notification.isSupported()) {
    new Notification({
      title: "💧 該喝水了！",
      body: "你已經很久沒喝水了，記得補充水分哦！",
      icon: ICON_PATH,
      silent: true,
    }).show();
  }
}

// ===== 水杯視窗 =====
function positionCupWindow() {
  if (!cupWindow) return;
  const { workArea } = screen.getPrimaryDisplay();
  const [w, h] = cupWindow.getSize();
  // 視窗貼齊工作區右下角；水杯靠視窗右下（由 cup.html padding 決定離角距離），
  // 視窗左上的多餘空間則留給碎裂時往螢幕內側飛散的碎片，避免被裁切。
  cupWindow.setPosition(
    Math.round(workArea.x + workArea.width - w),
    Math.round(workArea.y + workArea.height - h)
  );
}

function createCupWindow() {
  cupWindow = new BrowserWindow({
    width: 300,
    height: 300,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload-cup.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  cupWindow.setAlwaysOnTop(true, "screen-saver");
  cupWindow.loadFile(path.join(__dirname, "..", "renderer", "cup.html"));
  positionCupWindow();
}

// ===== 設定視窗（由原 popup 改寫） =====
function openSettings() {
  if (settingsWindow) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }
  settingsWindow = new BrowserWindow({
    width: 360,
    height: 640,
    resizable: false,
    title: "喝水提醒",
    icon: ICON_PATH,
    webPreferences: {
      preload: path.join(__dirname, "preload-settings.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  settingsWindow.setMenuBarVisibility(false);
  settingsWindow.loadFile(path.join(__dirname, "..", "renderer", "settings.html"));
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

// ===== 托盤 =====
function buildTrayMenu() {
  const { enabled = true } = store.get(["enabled"]);
  return Menu.buildFromTemplate([
    { label: "開啟設定 / 統計", click: () => openSettings() },
    { label: "立即提醒（測試）", click: () => triggerCup() },
    {
      label: "啟用提醒",
      type: "checkbox",
      checked: enabled,
      click: () => toggleEnabled(),
    },
    { type: "separator" },
    { label: "結束", click: () => quitApp() },
  ]);
}

function refreshTray() {
  if (!tray) return;
  const { todayMl = 0, dailyGoalMl = DEFAULT_DAILY_GOAL_ML } = store.get([
    "todayMl",
    "dailyGoalMl",
  ]);
  tray.setToolTip(`喝水提醒 — 今日 ${todayMl} / ${dailyGoalMl} ml`);
  tray.setContextMenu(buildTrayMenu());
}

function createTray() {
  let img = nativeImage.createFromPath(ICON_PATH);
  if (!img.isEmpty()) img = img.resize({ width: 16, height: 16 });
  tray = new Tray(img);
  tray.on("click", () => openSettings());
  refreshTray();
}

// ===== 業務邏輯（移植自 background.js） =====
function handleDrinkComplete(ml) {
  resetDailyIfNeeded();
  const { todayMl = 0, todayCups = 0, drinkMl = DRINK_ML } = store.get(["todayMl", "todayCups", "drinkMl"]);
  const addMl = ml ?? drinkMl;
  const newMl = todayMl + addMl;
  const newCups = todayCups + 1;
  store.set({ todayMl: newMl, todayCups: newCups });
  scheduleReminder(); // 喝完水重新計時
  refreshTray();
  return { todayMl: newMl, todayCups: newCups };
}

function getStatus() {
  resetDailyIfNeeded();
  const d = store.get([
    "todayMl",
    "todayCups",
    "intervalMin",
    "enabled",
    "dailyGoalMl",
    "soundEnabled",
    "soundVolume",
  ]);
  return {
    todayMl: d.todayMl ?? 0,
    todayCups: d.todayCups ?? 0,
    intervalMin: d.intervalMin ?? DEFAULT_INTERVAL_MIN,
    enabled: d.enabled ?? true,
    dailyGoalMl: d.dailyGoalMl ?? DEFAULT_DAILY_GOAL_ML,
    soundEnabled: d.soundEnabled ?? true,
    soundVolume: d.soundVolume ?? 80,
  };
}

function getWeeklyStats() {
  resetDailyIfNeeded();
  const d = store.get(["weeklyLog", "todayMl", "todayCups", "lastDate", "dailyGoalMl"]);
  const log = d.weeklyLog ?? [];
  const today = {
    date: d.lastDate ?? new Date().toDateString(),
    ml: d.todayMl ?? 0,
    cups: d.todayCups ?? 0,
  };
  return {
    log: [...log, today],
    dailyGoalMl: d.dailyGoalMl ?? DEFAULT_DAILY_GOAL_ML,
  };
}

function toggleEnabled() {
  const { enabled = true } = store.get(["enabled"]);
  const next = !enabled;
  store.set({ enabled: next });
  scheduleReminder();
  refreshTray();
  if (settingsWindow) settingsWindow.webContents.send("status-changed");
  return { enabled: next };
}

function exportPayload() {
  const data = store.get(null);
  return {
    exportedAt: new Date().toISOString(),
    todayMl: data.todayMl ?? 0,
    todayCups: data.todayCups ?? 0,
    lastDate: data.lastDate ?? null,
    weeklyLog: data.weeklyLog ?? [],
    dailyGoalMl: data.dailyGoalMl ?? DEFAULT_DAILY_GOAL_ML,
    intervalMin: data.intervalMin ?? DEFAULT_INTERVAL_MIN,
    enabled: data.enabled ?? true,
  };
}

function resetData() {
  store.set({
    todayMl: 0,
    todayCups: 0,
    weeklyLog: [],
    lastDate: new Date().toDateString(),
  });
  refreshTray();
  return { ok: true };
}

function quitApp() {
  app.isQuitting = true;
  app.quit();
}

// ===== IPC =====
function registerIpc() {
  // 設定視窗（invoke）
  ipcMain.handle("get-status", () => getStatus());
  ipcMain.handle("get-weekly-stats", () => getWeeklyStats());
  ipcMain.handle("set-settings", (_e, settings) => {
    if (settings.intervalMin != null) {
      store.set({ intervalMin: settings.intervalMin });
      scheduleReminder();
    }
    return { ok: true };
  });
  ipcMain.handle("toggle-enabled", () => toggleEnabled());
  ipcMain.handle("set-sound-settings", (_e, { soundEnabled, soundVolume }) => {
    store.set({ soundEnabled, soundVolume });
    return { ok: true };
  });
  ipcMain.handle("set-daily-goal", (_e, dailyGoalMl) => {
    store.set({ dailyGoalMl });
    refreshTray();
    return { ok: true };
  });
  ipcMain.handle("test-reminder", () => {
    triggerCup();
    return { ok: true };
  });
  ipcMain.handle("drink-now", (_e, ml) => {
    const result = handleDrinkComplete(ml);
    if (settingsWindow) settingsWindow.webContents.send("status-changed");
    return result;
  });
  ipcMain.handle("export-data", async () => {
    const payload = exportPayload();
    const { canceled, filePath } = await dialog.showSaveDialog(settingsWindow, {
      title: "匯出飲水資料",
      defaultPath: "drink-water-backup-" + new Date().toISOString().slice(0, 10) + ".json",
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (canceled || !filePath) return { ok: false, canceled: true };
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
    return { ok: true, filePath };
  });
  ipcMain.handle("reset-data", () => resetData());
  ipcMain.handle("get-sound-settings", () => {
    const { soundEnabled = true, soundVolume = 80 } = store.get([
      "soundEnabled",
      "soundVolume",
    ]);
    return { soundEnabled, soundVolume };
  });
  ipcMain.handle("get-prefs", () => {
    const d = store.get(["theme", "lang", "autoStart", "drinkMl", "cupStyle"]);
    return {
      theme: d.theme ?? "light",
      lang: d.lang ?? "zh-Hant",
      autoStart: d.autoStart ?? false,
      drinkMl: d.drinkMl ?? DRINK_ML,
      cupStyle: d.cupStyle ?? "classic",
    };
  });
  ipcMain.handle("set-prefs", (_e, prefs) => {
    const updates = {};
    if (prefs.theme != null) updates.theme = prefs.theme;
    if (prefs.lang != null) updates.lang = prefs.lang;
    if (prefs.drinkMl != null) updates.drinkMl = prefs.drinkMl;
    if (prefs.cupStyle != null) updates.cupStyle = prefs.cupStyle;
    if (prefs.autoStart != null) {
      updates.autoStart = prefs.autoStart;
      app.setLoginItemSettings({ openAtLogin: prefs.autoStart });
    }
    store.set(updates);
    return { ok: true };
  });

  // 水杯視窗（send）
  ipcMain.on("drink-complete", (_e, ml) => {
    handleDrinkComplete(ml);
    if (settingsWindow) settingsWindow.webContents.send("status-changed");
  });
  ipcMain.on("cup-dismissed", () => {
    if (cupWindow) {
      cupWindow.setIgnoreMouseEvents(true);
      cupWindow.hide();
    }
  });
}

// ===== 閒置 / 電源（取代 chrome.idle） =====
function registerPowerMonitor() {
  const pause = () => {
    paused = true;
    clearReminderTimer();
  };
  const resume = () => {
    paused = false;
    scheduleReminder();
  };
  powerMonitor.on("lock-screen", pause);
  powerMonitor.on("suspend", pause);
  powerMonitor.on("unlock-screen", resume);
  powerMonitor.on("resume", resume);
}

// ===== 自動更新 =====
function setupAutoUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.on("update-available", (info) => {
    dialog
      .showMessageBox({
        type: "info",
        title: "有新版本可用",
        message: `發現新版本 v${info.version}，是否立即下載更新？`,
        buttons: ["下載更新", "稍後再說"],
        defaultId: 0,
      })
      .then(({ response }) => {
        if (response === 0) autoUpdater.downloadUpdate();
      });
  });
  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox({
        type: "info",
        title: "更新已就緒",
        message: "更新已下載完成，重啟後即可套用新版本。",
        buttons: ["立即重啟", "稍後"],
        defaultId: 0,
      })
      .then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall();
      });
  });
  autoUpdater.checkForUpdates().catch(() => {});
}

// ===== 啟動 =====
app.whenReady().then(() => {
  // 初始化預設值（移植 onInstalled）
  const init = store.get(["intervalMin", "enabled"]);
  store.set({
    intervalMin: init.intervalMin ?? DEFAULT_INTERVAL_MIN,
    enabled: init.enabled ?? true,
  });
  resetDailyIfNeeded();

  registerIpc();
  registerPowerMonitor();
  createTray();
  createCupWindow();
  scheduleReminder();

  // 同步開機自動啟動設定
  const { autoStart = false } = store.get(["autoStart"]);
  app.setLoginItemSettings({ openAtLogin: autoStart });

  setupAutoUpdater();
});

// 常駐托盤：關閉所有視窗不結束 App
app.on("window-all-closed", (e) => {
  // 不呼叫 app.quit()，維持托盤常駐
});

app.on("before-quit", () => {
  app.isQuitting = true;
});
