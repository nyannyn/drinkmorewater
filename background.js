// ===== 常數 =====
const ALARM_NAME = "drink-reminder";
const DEFAULT_INTERVAL_MIN = 30;
const DRINK_ML = 300;
const DEFAULT_DAILY_GOAL_ML = 2000;

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

// ===== 跨日重設（含每週記錄） =====
async function resetDailyIfNeeded() {
  const today = new Date().toDateString();
  const data = await chrome.storage.local.get(["lastDate", "todayMl", "todayCups", "weeklyLog"]);
  if (data.lastDate !== today) {
    // 將前一天的數據推入 weeklyLog
    const log = data.weeklyLog ?? [];
    if (data.lastDate) {
      log.push({
        date: data.lastDate,
        ml: data.todayMl ?? 0,
        cups: data.todayCups ?? 0,
      });
      // 只保留最近 7 天
      while (log.length > 7) log.shift();
    }
    await chrome.storage.local.set({
      lastDate: today,
      todayMl: 0,
      todayCups: 0,
      weeklyLog: log,
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
  if (msg.type === "GET_WEEKLY_STATS") {
    getWeeklyStats().then(sendResponse);
    return true;
  }
  if (msg.type === "SET_DAILY_GOAL") {
    chrome.storage.local.set({ dailyGoalMl: msg.dailyGoalMl }).then(() => sendResponse({ ok: true }));
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
    "dailyGoalMl",
  ]);
  return {
    todayMl: data.todayMl ?? 0,
    todayCups: data.todayCups ?? 0,
    intervalMin: data.intervalMin ?? DEFAULT_INTERVAL_MIN,
    enabled: data.enabled ?? true,
    dailyGoalMl: data.dailyGoalMl ?? DEFAULT_DAILY_GOAL_ML,
  };
}

async function getWeeklyStats() {
  await resetDailyIfNeeded();
  const data = await chrome.storage.local.get(["weeklyLog", "todayMl", "todayCups", "lastDate", "dailyGoalMl"]);
  const log = data.weeklyLog ?? [];
  // 加入今天的數據
  const today = {
    date: data.lastDate ?? new Date().toDateString(),
    ml: data.todayMl ?? 0,
    cups: data.todayCups ?? 0,
  };
  return {
    log: [...log, today],
    dailyGoalMl: data.dailyGoalMl ?? DEFAULT_DAILY_GOAL_ML,
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
        // 等待注入完成後再發送
        await new Promise((resolve) => setTimeout(resolve, 200));
        await chrome.tabs.sendMessage(tab.id, { type: "DRINK_REMINDER" });
        return;
      } catch {
        // 注入或發送失敗，改用系統通知
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

// ===== 閒置偵測 =====
// 使用者離開/鎖定時暫停提醒，回來時恢復
chrome.idle.setDetectionInterval(60); // 60 秒無操作視為閒置

chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === "active") {
    // 使用者回來了，恢復鬧鐘
    await startAlarm();
  } else {
    // idle 或 locked，暫停鬧鐘
    await chrome.alarms.clear(ALARM_NAME);
  }
});
