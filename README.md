# 💧 喝水提醒 Drink Water Reminder

一款簡潔的 Chrome 擴充功能，定時提醒你喝水並追蹤每日飲水量。

## 功能

- **定時提醒** — 可自訂間隔（15 / 20 / 30 / 45 / 60 分鐘）
- **頁面水杯 UI** — 右下角浮動水杯，點擊即記錄一杯飲水
- **進度追蹤** — 水位隨飲水量上升，即時顯示 ml 數與杯數
- **提醒動畫** — 時間到時水杯搖晃 + 泡泡提示「該喝水囉！」
- **音效通知** — 透過 Web Audio API 產生提示音，無需額外音檔
- **每日自動重設** — 跨日自動歸零重新計算
- **Shadow DOM 隔離** — CSS 不會與網頁互相干擾
- **Popup 面板** — 查看今日進度、調整每杯容量與每日目標

## 安裝

1. 下載或 clone 此專案
   ```bash
   git clone https://github.com/nyannyn/drinkmorewater.git
   ```
2. 開啟 Chrome，前往 `chrome://extensions/`
3. 開啟右上角「開發人員模式」
4. 點擊「載入未封裝項目」，選擇此專案資料夾
5. 完成！水杯會出現在網頁右下角

## 使用方式

| 操作 | 說明 |
|---|---|
| **點擊水杯** | 記錄喝了一杯水，水位上升 |
| **點擊擴充功能圖示** | 開啟 Popup 面板，查看進度與設定 |
| **調整設定** | 在 Popup 中修改提醒間隔、杯量、每日目標 |
| **收合水杯** | hover 水杯後點擊左上角 `−` 按鈕 |

## 檔案結構

```
drinkmorewater/
├── manifest.json      # MV3 擴充功能設定
├── background.js      # Service Worker：鬧鐘、狀態管理
├── content.js         # 頁面注入：Shadow DOM 水杯 UI
├── offscreen.html     # Offscreen Document 容器
├── offscreen.js       # Web Audio API 音效播放
├── popup.html         # Popup 面板 UI
├── popup.js           # Popup 邏輯
└── icons/             # 擴充功能圖示（建議替換為正式圖示）
```

## 權限說明

| 權限 | 用途 |
|---|---|
| `alarms` | 背景定時提醒 |
| `storage` | 儲存飲水紀錄與設定 |
| `scripting` | 動態注入腳本 |
| `offscreen` | 背景播放音效 |
| `host_permissions` | 在所有網頁注入水杯 UI |

## License

MIT
