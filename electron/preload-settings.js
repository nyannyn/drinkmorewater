const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getStatus: () => ipcRenderer.invoke("get-status"),
  getWeeklyStats: () => ipcRenderer.invoke("get-weekly-stats"),
  setSettings: (settings) => ipcRenderer.invoke("set-settings", settings),
  toggleEnabled: () => ipcRenderer.invoke("toggle-enabled"),
  setSoundSettings: (soundEnabled, soundVolume) =>
    ipcRenderer.invoke("set-sound-settings", { soundEnabled, soundVolume }),
  setDailyGoal: (dailyGoalMl) => ipcRenderer.invoke("set-daily-goal", dailyGoalMl),
  testReminder: () => ipcRenderer.invoke("test-reminder"),
  exportData: () => ipcRenderer.invoke("export-data"),
  resetData: () => ipcRenderer.invoke("reset-data"),
  resetToday: () => ipcRenderer.invoke("reset-today"),
  getPrefs: () => ipcRenderer.invoke("get-prefs"),
  setPrefs: (prefs) => ipcRenderer.invoke("set-prefs", prefs),
  drinkNow: (ml) => ipcRenderer.invoke("drink-now", ml),
  // 跨裝置同步
  syncStatus: () => ipcRenderer.invoke("sync-status"),
  syncCreateCode: (url) => ipcRenderer.invoke("sync-create-code", url),
  syncClaimCode: (url, code) => ipcRenderer.invoke("sync-claim-code", { url, code }),
  syncNow: () => ipcRenderer.invoke("sync-now"),
  syncUnlink: () => ipcRenderer.invoke("sync-unlink"),
  // 水杯喝水後主行程通知刷新
  onStatusChanged: (cb) => ipcRenderer.on("status-changed", () => cb()),
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
});
