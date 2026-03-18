// ===== 常數 =====
const ALARM_NAME = "drink-reminder";
const DEFAULT_INTERVAL_MIN = 30;
const DAILY_GOAL_ML = 2000;
const CUP_ML = 250;

// ===== 初始化 =====
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get([
    "intervalMin",
    "dailyGoal",
    "cupMl",
    "enabled",
  ]);
  await chrome.storage.local.set({
    intervalMin: data.intervalMin ?? DEFAULT_INTERVAL_MIN,
    dailyGoal: data.dailyGoal ?? DAILY_GOAL_ML,
    cupMl: data.cupMl ?? CUP_ML,
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
  await playSound();

  const tabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
  for (const tab of tabs) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "DRINK_REMINDER" });
    } catch {
      // content script 尚未載入，忽略
    }
  }
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
    justification: "播放喝水提醒音效",
  });
  await creatingOffscreen;
  creatingOffscreen = null;
}

async function playSound() {
  await ensureOffscreenDocument();
  chrome.runtime.sendMessage({ type: "PLAY_SOUND" });
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
  if (msg.type === "DRINK") {
    handleDrink(msg.ml).then(sendResponse);
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
});

async function handleDrink(ml) {
  await resetDailyIfNeeded();
  const { todayMl = 0, todayCups = 0, cupMl = CUP_ML } =
    await chrome.storage.local.get(["todayMl", "todayCups", "cupMl"]);
  const addMl = ml ?? cupMl;
  const newMl = todayMl + addMl;
  const newCups = todayCups + 1;
  await chrome.storage.local.set({ todayMl: newMl, todayCups: newCups });
  await startAlarm();
  return { todayMl: newMl, todayCups: newCups };
}

async function getStatus() {
  await resetDailyIfNeeded();
  const data = await chrome.storage.local.get([
    "todayMl",
    "todayCups",
    "dailyGoal",
    "cupMl",
    "intervalMin",
    "enabled",
  ]);
  return {
    todayMl: data.todayMl ?? 0,
    todayCups: data.todayCups ?? 0,
    dailyGoal: data.dailyGoal ?? DAILY_GOAL_ML,
    cupMl: data.cupMl ?? CUP_ML,
    intervalMin: data.intervalMin ?? DEFAULT_INTERVAL_MIN,
    enabled: data.enabled ?? true,
  };
}

async function setSettings(settings) {
  const patch = {};
  if (settings.intervalMin != null) patch.intervalMin = settings.intervalMin;
  if (settings.dailyGoal != null) patch.dailyGoal = settings.dailyGoal;
  if (settings.cupMl != null) patch.cupMl = settings.cupMl;
  await chrome.storage.local.set(patch);
  if (settings.intervalMin != null) await startAlarm();
  return { ok: true };
}

async function toggleEnabled() {
  const { enabled } = await chrome.storage.local.get("enabled");
  const next = !enabled;
  await chrome.storage.local.set({ enabled: next });
  await startAlarm();
  return { enabled: next };
}
