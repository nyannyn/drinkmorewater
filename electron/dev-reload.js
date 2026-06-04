// 開發用熱重載（zero-dependency、跨平台）。
//
// - renderer/ 內檔案變更（HTML / CSS / JS）→ 即時重載所有視窗的 webContents
// - electron/ 內檔案變更（main.js / store.js / preload）→ 重啟整個 App
//
// 僅在「未打包」時由 main.js 引入啟用（見 main.js），正式打包版不會載入，
// 不需安裝 nodemon / electronmon 等額外工具。可用 DRINK_DEV=0 關閉。

const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

function debounce(fn, ms) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// renderer 與 electron 目錄皆為扁平結構（無子資料夾），
// 因此不需 recursive watch，可跨 macOS / Windows / Linux 一致運作。
function watchDir(dir, onChange) {
  try {
    return fs.watch(dir, (_event, filename) => {
      if (filename) onChange(filename);
    });
  } catch (err) {
    console.warn(`[dev] cannot watch ${dir}: ${err.message}`);
    return null;
  }
}

function enableDevReload() {
  const root = path.join(__dirname, "..");
  const rendererDir = path.join(root, "renderer");
  const mainDir = __dirname;
  let restarting = false;
  const startTime = Date.now();

  // renderer 變更：重載所有視窗（保留 preload / 視窗狀態）
  const reloadRenderer = debounce((filename) => {
    if (Date.now() - startTime < 1500) return; // 忽略啟動時 Windows fs.watch 假事件
    console.log(`[dev] renderer changed: ${filename} -> reload`);
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) win.webContents.reloadIgnoringCache();
    }
  }, 120);

  // 主行程 / preload 變更：重啟整個 App（preload 變更需重建視窗）
  const restartApp = debounce((filename) => {
    if (Date.now() - startTime < 1500) return; // 忽略啟動時 Windows fs.watch 假事件
    if (restarting) return;
    restarting = true;
    console.log(`[dev] main changed: ${filename} -> restart App`);
    app.relaunch();
    app.exit(0);
  }, 150);

  const watchers = [
    watchDir(rendererDir, reloadRenderer),
    watchDir(mainDir, (filename) => {
      if (filename.startsWith("dev-reload")) return; // 別被自己觸發
      restartApp(filename);
    }),
  ];

  app.on("before-quit", () => {
    for (const w of watchers) if (w) w.close();
  });

  console.log("[dev] hot-reload enabled (renderer live-reload / main auto-restart)");
}

module.exports = { enableDevReload };
