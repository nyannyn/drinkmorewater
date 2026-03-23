// ===== 常數 =====
const ALARM_NAME = "drink-reminder";
const DEFAULT_INTERVAL_MIN = 1; // 測試期 1 分鐘（正式改為 60）
const DRINK_ML = 300;

// ===== 初始化 =====
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(["intervalMin", "enabled"]);
  await chrome.storage.local.set({
    intervalMin: data.intervalMin ?? DEFAULT_INTERVAL_MIN,
    enabled: data.enabled ?? true,
  });
  await resetDailyIfNeeded();
  await startAlarm();
});

chrome.runtime.onStartup.addListener(async () => {
  await resetDailyIfNeeded();
  await startAlarm();
});

// ===== 鬧鐘 =====
async function startAlarm() {
  const { intervalMin, enabled } = await chrome.storage.local.get([
    "intervalMin",
    "enabled",
  ]);
  await chrome.alarms.clear(ALARM_NAME);
  if (enabled) {
    chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: intervalMin ?? DEFAULT_INTERVAL_MIN,
      periodInMinutes: intervalMin ?? DEFAULT_INTERVAL_MIN,
    });
  }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;
  await resetDailyIfNeeded();

  // 通知當前分頁進入「口渴模式」
  await notifyActiveTab();
});

// ===== Offscreen 音效 =====
let creatingOffscreen = null;

async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
  });
  if (existingContexts.length > 0) return;
  if (creatingOffscreen) {
    await creatingOffscreen;
    return;
  }
  creatingOffscreen = chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "播放喝水完成音效",
  });
  await creatingOffscreen;
  creatingOffscreen = null;
}

async function playDingSound() {
  await ensureOffscreenDocument();
  chrome.runtime.sendMessage({ type: "PLAY_DING" });
}

// ===== 跨日重設 =====
async function resetDailyIfNeeded() {
  const today = new Date().toDateString();
  const { lastDate } = await chrome.storage.local.get("lastDate");
  if (lastDate !== today) {
    await chrome.storage.local.set({
      lastDate: today,
      todayMl: 0,
      todayCups: 0,
    });
  }
}

// ===== 訊息處理 =====
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "DRINK_COMPLETE") {
    handleDrinkComplete(msg.ml).then(sendResponse);
    return true;
  }
  if (msg.type === "GET_STATUS") {
    getStatus().then(sendResponse);
    return true;
  }
  if (msg.type === "SET_SETTINGS") {
    setSettings(msg.settings).then(sendResponse);
    return true;
  }
  if (msg.type === "TOGGLE_ENABLED") {
    toggleEnabled().then(sendResponse);
    return true;
  }
  if (msg.type === "PLAY_DING_REQUEST") {
    playDingSound().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === "TEST_REMINDER") {
    notifyActiveTab().then(() => sendResponse({ ok: true }));
    return true;
  }
});

async function handleDrinkComplete(ml) {
  await resetDailyIfNeeded();
  const { todayMl = 0, todayCups = 0 } = await chrome.storage.local.get([
    "todayMl",
    "todayCups",
  ]);
  const addMl = ml ?? DRINK_ML;
  const newMl = todayMl + addMl;
  const newCups = todayCups + 1;
  await chrome.storage.local.set({ todayMl: newMl, todayCups: newCups });

  // 喝完水，重新開始計時
  await startAlarm();

  return { todayMl: newMl, todayCups: newCups };
}

async function getStatus() {
  await resetDailyIfNeeded();
  const data = await chrome.storage.local.get([
    "todayMl",
    "todayCups",
    "intervalMin",
    "enabled",
  ]);
  return {
    todayMl: data.todayMl ?? 0,
    todayCups: data.todayCups ?? 0,
    intervalMin: data.intervalMin ?? DEFAULT_INTERVAL_MIN,
    enabled: data.enabled ?? true,
  };
}

async function setSettings(settings) {
  if (settings.intervalMin != null) {
    await chrome.storage.local.set({ intervalMin: settings.intervalMin });
    await startAlarm();
  }
  return { ok: true };
}

// 只通知當前分頁（active tab），若無合適分頁則用系統通知
async function notifyActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const tab = tabs[0];

  // 若當前分頁是 http/https，直接發送
  if (tab && /^https?:\/\//.test(tab.url)) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "DRINK_REMINDER" });
      return;
    } catch {
      // content script 尚未載入，先注入再發送
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        });
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, { type: "DRINK_REMINDER" }).catch(() => {});
        }, 200);
        return;
      } catch {
        // 注入失敗，改用系統通知
      }
    }
  }

  // 備援：使用系統通知（例如當前分頁是 chrome:// 頁面）
  chrome.notifications.create("drink-reminder", {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "💧 該喝水了！",
    message: "你已經很久沒喝水了，記得補充水分哦！",
    priority: 2,
  });
}

async function toggleEnabled() {
  const { enabled } = await chrome.storage.local.get("enabled");
  const next = !enabled;
  await chrome.storage.local.set({ enabled: next });
  await startAlarm();
  return { enabled: next };
}
