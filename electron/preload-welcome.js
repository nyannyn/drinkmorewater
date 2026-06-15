const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("welcomeApi", {
  getInfo: () => ipcRenderer.sendSync("welcome-get-info"),
  done: () => ipcRenderer.send("welcome-done"),
});
