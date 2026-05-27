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
  // 水杯喝水後主行程通知刷新
  onStatusChanged: (cb) => ipcRenderer.on("status-changed", () => cb()),
});
