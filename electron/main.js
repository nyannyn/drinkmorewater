const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  Notification,
  dialog,
  shell,
  screen,
  powerMonitor,
  nativeImage,
} = require("electron");
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");
const store = require("./store");
const sync = require("./sync");

// 同步後通知畫面與托盤刷新（fire-and-forget，失敗不影響離線使用）
function triggerSync() {
  sync
    .sync()
    .then((res) => {
      if (res) {
        refreshTray();
        if (settingsWindow) settingsWindow.webContents.send("status-changed");
      }
    })
    .catch(() => {});
}

// 設定變更：標記時間戳（供跨裝置 last-write-wins）並觸發同步
function onSettingsChanged() {
  sync.markSettingsChanged();
  triggerSync();
}

// ===== 常數 =====
const DEFAULT_INTERVAL_MIN = 30;
const DRINK_ML = 300;
const DEFAULT_DAILY_GOAL_ML = 2000;
const IDLE_AWAY_SEC = 5 * 60; // 離開超過 5 分鐘視為不在位，略過該次提醒

const ICON_PATH = path.join(__dirname, "..", "build", "icon.png");
const NOTIF_ICON_PATH = path.join(__dirname, "..", "build", "notification.png");

// Windows 工作列圖示需要 AppUserModelId 才能正確顯示自訂 icon
app.setAppUserModelId("com.drinkwater.reminder");

// ===== 主行程多語（通知 / 托盤）— 與設定視窗語言一致 =====
const MAIN_I18N = {
  "zh-Hant": {
    notifyTitle: "💧 該喝水了！",
    notifyBody: "你已經很久沒喝水了，記得補充水分哦！",
    traySettings: "開啟設定 / 統計",
    trayTest: "立即提醒（測試）",
    trayEnable: "啟用提醒",
    trayQuit: "結束",
    trayTip: (ml, goal) => `喝水提醒 — 今日 ${ml} / ${goal} ml`,
  },
  "zh-Hans": {
    notifyTitle: "💧 该喝水了！",
    notifyBody: "你已经很久没喝水了，记得补充水分哦！",
    traySettings: "打开设置 / 统计",
    trayTest: "立即提醒（测试）",
    trayEnable: "启用提醒",
    trayQuit: "退出",
    trayTip: (ml, goal) => `喝水提醒 — 今日 ${ml} / ${goal} ml`,
  },
  en: {
    notifyTitle: "💧 Time to drink!",
    notifyBody: "You haven't had water in a while — stay hydrated!",
    traySettings: "Open settings / stats",
    trayTest: "Remind now (test)",
    trayEnable: "Enable reminders",
    trayQuit: "Quit",
    trayTip: (ml, goal) => `Drink Water — Today ${ml} / ${goal} ml`,
  },
  ja: {
    notifyTitle: "💧 水を飲む時間です！",
    notifyBody: "しばらく水を飲んでいません。水分補給を忘れずに！",
    traySettings: "設定 / 統計を開く",
    trayTest: "今すぐ通知（テスト）",
    trayEnable: "通知を有効化",
    trayQuit: "終了",
    trayTip: (ml, goal) => `水飲みリマインダー — 本日 ${ml} / ${goal} ml`,
  },
};

function mt(key) {
  const { lang = "zh-Hant" } = store.get(["lang"]);
  return MAIN_I18N[lang]?.[key] ?? MAIN_I18N["zh-Hant"][key];
}

let tray = null;
let cupWindow = null;
let settingsWindow = null;
let welcomeWindow = null;
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
  if (!cupWindow || cupWindow.isDestroyed()) {
    cupWindow = null;
    createCupWindow();
  }

  const { bannerEnabled = true } = store.get(["bannerEnabled"]);
  const { cupStyle = "classic", lang = "zh-Hant", holdSpeed = 1 } = store.get(["cupStyle", "lang", "holdSpeed"]);

  // 確保頁面已載入完成再發送 reminder
  const sendReminder = () => {
    positionCupWindow(!bannerEnabled || !Notification.isSupported());
    cupWindow.showInactive();
    cupWindow.setIgnoreMouseEvents(false);
    cupWindow.webContents.send("reminder", { cupStyle, lang, holdSpeed });
  };

  if (cupWindow.webContents.isLoading()) {
    cupWindow.webContents.once("did-finish-load", sendReminder);
  } else {
    sendReminder();
  }

  if (bannerEnabled && Notification.isSupported()) {
    const notif = new Notification({
      title: mt("notifyTitle"),
      body: mt("notifyBody"),
      icon: NOTIF_ICON_PATH,
      silent: true,
    });
    notif.show();
    setTimeout(() => notif.close(), 3000);
  }
}

// ===== 水杯視窗 =====
function positionCupWindow(bottomCorner) {
  if (!cupWindow) return;
  // 若使用者曾手動拖曳，沿用上次位置
  const saved = store.get(["cupPosX", "cupPosY"]);
  if (saved.cupPosX != null && saved.cupPosY != null) {
    // 確認螢幕上仍可見（可能螢幕已拔除）
    const displays = screen.getAllDisplays();
    const visible = displays.some((d) => {
      const { x, y, width, height } = d.workArea;
      return saved.cupPosX >= x && saved.cupPosX < x + width &&
             saved.cupPosY >= y && saved.cupPosY < y + height;
    });
    if (visible) {
      cupWindow.setPosition(Math.round(saved.cupPosX), Math.round(saved.cupPosY));
      return;
    }
  }
  // 沒有儲存位置或不可見，fallback 到右下角
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const { workArea } = display;
  const [w, h] = cupWindow.getSize();
  const notifyOffset = (!bottomCorner && process.platform === "win32") ? 120 : 0;
  cupWindow.setPosition(
    Math.round(workArea.x + workArea.width - w),
    Math.round(workArea.y + workArea.height - h - notifyOffset)
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
  cupWindow.on("closed", () => { cupWindow = null; });
  // 拖曳後記住位置，並修復 Windows 透明視窗拖曳後消失的問題
  cupWindow.on("moved", () => {
    if (cupWindow && !cupWindow.isDestroyed()) {
      const [x, y] = cupWindow.getPosition();
      store.set({ cupPosX: x, cupPosY: y });
      // Windows 透明視窗拖曳後有時不重繪，用微調尺寸強制刷新
      if (process.platform === "win32") {
        const [w, h] = cupWindow.getSize();
        cupWindow.setSize(w + 1, h);
        cupWindow.setSize(w, h);
      }
    }
  });
}

// ===== 歡迎視窗（首次啟動） =====
function createWelcomeWindow() {
  welcomeWindow = new BrowserWindow({
    width: 420,
    height: 480,
    resizable: false,
    center: true,
    title: "喝水提醒",
    icon: ICON_PATH,
    webPreferences: {
      preload: path.join(__dirname, "preload-welcome.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  welcomeWindow.setMenuBarVisibility(false);
  welcomeWindow.loadFile(path.join(__dirname, "..", "renderer", "welcome.html"));
  welcomeWindow.on("closed", () => {
    welcomeWindow = null;
    openSettings();
  });
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
    { label: mt("traySettings"), click: () => openSettings() },
    { label: mt("trayTest"), click: () => triggerCup() },
    {
      label: mt("trayEnable"),
      type: "checkbox",
      checked: enabled,
      click: () => toggleEnabled(),
    },
    { type: "separator" },
    { label: mt("trayQuit"), click: () => quitApp() },
  ]);
}

function refreshTray() {
  if (!tray) return;
  const { todayMl = 0, dailyGoalMl = DEFAULT_DAILY_GOAL_ML } = store.get([
    "todayMl",
    "dailyGoalMl",
  ]);
  tray.setToolTip(mt("trayTip")(todayMl, dailyGoalMl));
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
  triggerSync(); // 推送本機新數據、拉回其他裝置
  return { todayMl: newMl, todayCups: newCups };
}

// 顯示值疊加其他裝置貢獻（未連動時等同本機）。
async function getStatus() {
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
  const disp = await sync.getDisplayTracking();
  return {
    todayMl: disp.todayMl,
    todayCups: disp.todayCups,
    intervalMin: d.intervalMin ?? DEFAULT_INTERVAL_MIN,
    enabled: d.enabled ?? true,
    dailyGoalMl: d.dailyGoalMl ?? DEFAULT_DAILY_GOAL_ML,
    soundEnabled: d.soundEnabled ?? false,
    soundVolume: d.soundVolume ?? 80,
  };
}

async function getWeeklyStats() {
  resetDailyIfNeeded();
  const d = store.get(["dailyGoalMl"]);
  const disp = await sync.getDisplayTracking();
  const today = { date: disp.lastDate, ml: disp.todayMl, cups: disp.todayCups };
  return {
    log: [...disp.weeklyLog, today],
    dailyGoalMl: d.dailyGoalMl ?? DEFAULT_DAILY_GOAL_ML,
  };
}

function toggleEnabled() {
  const { enabled = true } = store.get(["enabled"]);
  const next = !enabled;
  store.set({ enabled: next });
  scheduleReminder();
  refreshTray();
  onSettingsChanged();
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

function resetToday() {
  store.set({
    todayMl: 0,
    todayCups: 0,
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
      onSettingsChanged();
    }
    return { ok: true };
  });
  ipcMain.handle("toggle-enabled", () => toggleEnabled());
  ipcMain.handle("set-sound-settings", (_e, { soundEnabled, soundVolume }) => {
    store.set({ soundEnabled, soundVolume });
    onSettingsChanged();
    return { ok: true };
  });
  ipcMain.handle("set-daily-goal", (_e, dailyGoalMl) => {
    store.set({ dailyGoalMl });
    refreshTray();
    onSettingsChanged();
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
  ipcMain.handle("reset-today", () => resetToday());
  ipcMain.handle("open-external", (_e, url) => {
    // Only allow opening GitHub URLs for safety
    if (typeof url === "string" && url.startsWith("https://github.com/nyannyn/drinkmorewater")) {
      shell.openExternal(url);
    }
  });
  ipcMain.handle("get-sound-settings", () => {
    const { soundEnabled = false, soundVolume = 80 } = store.get([
      "soundEnabled",
      "soundVolume",
    ]);
    return { soundEnabled, soundVolume };
  });
  ipcMain.handle("get-prefs", () => {
    const d = store.get(["theme", "lang", "autoStart", "drinkMl", "cupStyle", "holdSpeed", "bannerEnabled"]);
    return {
      theme: d.theme ?? "light",
      lang: d.lang ?? "zh-Hant",
      autoStart: d.autoStart ?? false,
      drinkMl: d.drinkMl ?? DRINK_ML,
      cupStyle: d.cupStyle ?? "classic",
      holdSpeed: d.holdSpeed ?? 1,
      bannerEnabled: d.bannerEnabled ?? true,
    };
  });
  ipcMain.handle("set-prefs", (_e, prefs) => {
    const updates = {};
    if (prefs.theme != null) updates.theme = prefs.theme;
    if (prefs.lang != null) updates.lang = prefs.lang;
    if (prefs.drinkMl != null) updates.drinkMl = prefs.drinkMl;
    if (prefs.cupStyle != null) updates.cupStyle = prefs.cupStyle;
    if (prefs.holdSpeed != null) updates.holdSpeed = prefs.holdSpeed;
    if (prefs.bannerEnabled != null) updates.bannerEnabled = prefs.bannerEnabled;
    if (prefs.autoStart != null) {
      updates.autoStart = prefs.autoStart;
      app.setLoginItemSettings({ openAtLogin: prefs.autoStart });
    }
    store.set(updates);
    if (prefs.lang != null) refreshTray(); // 語言改變即時更新托盤選單 / tooltip
    // drinkMl / lang 屬於跨裝置同步的設定
    if (prefs.drinkMl != null || prefs.lang != null) onSettingsChanged();
    return { ok: true };
  });

  // ===== 跨裝置同步 IPC =====
  ipcMain.handle("sync-status", async () => ({
    linked: await sync.isLinked(),
    serverUrl: await sync.getServerUrl(),
  }));
  ipcMain.handle("sync-create-code", async (_e, url) => {
    try {
      const { code } = await sync.createPairingCode(url);
      triggerSync();
      return { ok: true, code };
    } catch (e) {
      return { ok: false, error: String((e && e.message) || e) };
    }
  });
  ipcMain.handle("sync-claim-code", async (_e, { url, code }) => {
    try {
      await sync.claimPairingCode(url, code);
      triggerSync();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String((e && e.message) || e) };
    }
  });
  ipcMain.handle("sync-now", async () => {
    try {
      await sync.sync();
      refreshTray();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String((e && e.message) || e) };
    }
  });
  ipcMain.handle("sync-unlink", async () => {
    await sync.unlink();
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

  // 歡迎視窗
  ipcMain.on("welcome-get-info", (e) => {
    const { lang = "zh-Hant" } = store.get(["lang"]);
    e.returnValue = { lang, platform: process.platform };
  });
  ipcMain.on("welcome-done", () => {
    if (welcomeWindow && !welcomeWindow.isDestroyed()) {
      welcomeWindow.close();
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

  // Watchdog：每 3 分鐘檢查計時器是否意外停止（防 resume/unlock 事件遺失）
  setInterval(() => {
    const { enabled = true } = store.get(["enabled"]);
    if (!enabled) return;
    // 如果系統 idle 短於閒置門檻，代表使用者正在用電腦
    const userActive = powerMonitor.getSystemIdleTime() < IDLE_AWAY_SEC;
    if (paused && userActive) {
      // resume/unlock 事件遺失，強制解除暫停
      paused = false;
    }
    if (!paused && !reminderTimer) {
      scheduleReminder();
    }
  }, 3 * 60 * 1000);
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
  // 開發熱重載：未打包時啟用（DRINK_DEV=0 可關閉）；正式打包版不載入。
  if (!app.isPackaged && process.env.DRINK_DEV !== "0") {
    require("./dev-reload").enableDevReload();
  }

  // macOS: 隱藏 dock 圖示，純選單列 app（對應 Win/Linux 的 tray-only 行為）
  if (process.platform === "darwin" && app.dock) app.dock.hide();

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
  triggerSync(); // 啟動時拉一次其他裝置數據

  // 首次啟動顯示歡迎視窗
  const { welcomeShown } = store.get(["welcomeShown"]);
  if (!welcomeShown) {
    store.set({ welcomeShown: true });
    createWelcomeWindow();
  }

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
