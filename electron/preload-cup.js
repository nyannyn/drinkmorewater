const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cupApi", {
  // 主行程通知「該喝水了」（payload 含目前杯子樣式）
  onReminder: (cb) => ipcRenderer.on("reminder", (_e, payload) => cb(payload)),
  // 喝完水回報水量
  drinkComplete: (ml) => ipcRenderer.send("drink-complete", ml),
  // 喝完 / 碎裂後，請主行程隱藏視窗
  dismissed: () => ipcRenderer.send("cup-dismissed"),
  // 讀取音效設定（喝滿時決定是否播「叮」）
  getSoundSettings: () => ipcRenderer.invoke("get-sound-settings"),
});
