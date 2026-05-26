# 💧 喝水提醒 Drink Water Reminder（桌面版）

一款常駐系統托盤的喝水提醒軟體，時間到會在桌面右下角浮現一個搖晃的水杯，長按 3 秒喝水，並追蹤每日 / 每週飲水量。以 [Electron](https://www.electronjs.org/) 打包成可下載安裝的 Windows 應用程式。

> 本專案原為 Chrome 擴充功能，已改寫為桌面應用程式。原擴充程式的水杯動畫、音效與統計邏輯皆完整保留。

## 功能

- **定時提醒** — 可自訂間隔（15 / 30 / 45 / 60 分鐘）
- **桌面懸浮水杯** — 平常隱藏；時間到才在右下角浮現、搖晃、提示「該喝水囉！」
- **長按喝水** — 長按水杯 3 秒（或按 Space / Enter）記錄 300ml，水位上升並播放「叮」音效
- **碎裂懲罰** — 1 分鐘不理會，水杯會裂開、碎片飛散後消失
- **系統通知** — 提醒同時發出原生系統通知
- **進度與統計** — 今日 ml / 杯數、每日目標進度、過去 7 天長條圖
- **系統托盤常駐** — 隨時開啟設定、立即測試、啟用 / 停用提醒
- **閒置暫停** — 鎖屏 / 睡眠時自動暫停，回來後恢復
- **資料匯出 / 重置** — 一鍵備份成 JSON

## 開發 / 執行

需先安裝 [Node.js](https://nodejs.org/)（18+）。

```bash
npm install      # 安裝相依（會下載 Electron 二進位，需網路）
npm start        # 啟動 App（出現托盤水滴圖示）
```

## 打包成 Windows 安裝程式

```bash
npm run dist:win
```

於 `dist/` 產出：

- `喝水提醒 Setup x.y.z.exe` — NSIS 安裝程式
- `喝水提醒 x.y.z.exe` — 免安裝可攜版

> ⚠️ 建議在 **Windows** 上執行打包。在 Linux / macOS 上產生 Windows 安裝程式需額外安裝 wine 等工具。

## 使用方式

| 操作 | 說明 |
|---|---|
| **托盤圖示左鍵** | 開啟設定 / 統計視窗 |
| **托盤圖示右鍵** | 選單：開啟設定、立即提醒、啟用提醒、結束 |
| **長按水杯 3 秒** | 記錄喝水 300ml（按住期間水位上升） |
| **Space / Enter** | 水杯出現且取得焦點時，快速記錄一杯 |
| **拖曳提示文字** | 移動水杯位置 |

## 專案結構

```
drinkmorewater/
├── package.json            # Electron / electron-builder 設定
├── electron/
│   ├── main.js             # 主行程：托盤、計時器、通知、IPC、閒置偵測
│   ├── store.js            # JSON 檔資料儲存（取代 chrome.storage.local）
│   ├── preload-cup.js      # 水杯視窗 preload（contextBridge）
│   └── preload-settings.js # 設定視窗 preload（contextBridge）
├── renderer/
│   ├── cup.html / cup.js          # 透明懸浮水杯視窗（移植自 content.js + offscreen.js）
│   └── settings.html / settings.js# 設定 / 統計視窗（移植自 popup.html/js）
├── build/
│   ├── icon.png            # App / 托盤圖示（256px 水滴）
│   └── make-icons.js       # 純 Node 圖示產生器
└── (manifest.json, background.js, content.js ... 為原 Chrome 擴充版檔案，保留供對照)
```

## 技術對應（擴充 → 桌面）

| Chrome 擴充 | Electron 桌面 |
|---|---|
| `chrome.alarms` | Node `setTimeout` 計時 |
| `chrome.storage.local` | `userData/data.json` |
| `chrome.notifications` | 原生 `Notification` |
| `chrome.idle` | `powerMonitor`（鎖屏 / 睡眠 / 閒置） |
| `chrome.offscreen` 音效 | 水杯視窗 renderer 內 Web Audio |
| content script 注入網頁 | 透明置頂 BrowserWindow |
| `chrome.runtime.sendMessage` | `ipcMain` / `ipcRenderer`（透過 preload） |

## License

MIT
