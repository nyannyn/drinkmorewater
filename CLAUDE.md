# CLAUDE.md — 專案記憶

> 喝水提醒 Drink Water Reminder。給 Claude / 開發者快速掌握此 repo 的脈絡。
> Repo: `nyannyn/drinkmorewater`

## 一句話

定時提醒喝水、追蹤每日 / 每週飲水量。原為 Chrome 擴充，現為 **Electron 桌面版**（Windows / Linux / macOS），並有 **iOS 手機版**（React Native / Expo，原生本地排程通知）。

## 兩個應用

| | 桌面版 | 手機版 |
|---|---|---|
| 技術 | Electron 31，vanilla HTML/CSS/JS | React Native / Expo（TypeScript）|
| 位置 | `electron/` + `renderer/` | `mobile/` |
| 提醒機制 | 主行程 `setTimeout` 計時 | `expo-notifications` 預排 OS 本地通知 |
| 狀態 | 已發行（release.yml 出 Win/Linux/macOS）| 尚未上架（需 macOS / EAS build）|

## 桌面版架構

- `electron/main.js` — 主行程：托盤、提醒計時器、通知、IPC、閒置/電源偵測、自動更新、多語（通知/托盤）。
- `electron/store.js` — JSON 檔持久化（`userData/data.json`），記憶體快取。
- `electron/preload-cup.js` / `preload-settings.js` — contextBridge 暴露 `cupApi` / `api`。
- `electron/dev-reload.js` — 零依賴熱重載（未打包時啟用）。
- `renderer/cup.html` + `cup.js` — 透明置頂懸浮水杯（搖晃、長按喝水、碎裂動畫、Web Audio「叮」、多語提示）。
- `renderer/cup-styles.js` — 5 種杯款 SVG（classic/mug/boba/flask/bottle）。
- `renderer/settings.html` + `settings.js` — 設定/統計視窗（5 主題、4 語、每週長條圖）。
- `renderer/fonts.css` — base64 內嵌字型（Quicksand / Playfair Display / JetBrains Mono，latin subset）。

### 資料 schema（store keys，手機版沿用）
`todayMl`, `todayCups`, `lastDate`, `weeklyLog[]`, `dailyGoalMl`, `intervalMin`, `enabled`, `soundEnabled`, `soundVolume`, `theme`, `lang`, `autoStart`, `drinkMl`, `cupStyle`。手機版另有 `activeStart` / `activeEnd`（活躍時段）。

### 預設值
間隔 30 分、每次 300ml、每日目標 2000ml、閒置超過 5 分鐘略過該次提醒。

## 手機版架構（mobile/）

- `src/core/` — 平台無關純邏輯：`schedule.ts`（排程時間計算、活躍時段、iOS 64 則上限）、`tracking.ts`（跨日重設/記錄/週統計）、`storage.ts`（AsyncStorage）、`types.ts`。含 `__tests__`（node:test，schedule 5 項 + i18n 3 項）。
- `src/i18n.ts` — 4 語字串表（繁中/簡中/英/日，沿用桌面語氣），含通知文字與週圖星期縮寫；設定頁可切換，通知/週圖隨語言本地化。
- `src/notifications/notify.ts` — 權限、通知類別（「我喝了」動作鈕，文字本地化）、排程/取消。
- `App.tsx` — 權限流程、通知回應監聽、進前景重排。
- 關鍵：手機背景無法用 setTimeout → 預先算一批時間點交給 OS，進前景補排。

## 建置 / 發版

- 桌面開發：`npm start`（自動熱重載；`DRINK_DEV=0` 關閉）。
- 桌面打包：`npm run dist:win|dist:linux|dist:mac`。
- 發版：推 tag `v*` → `.github/workflows/release.yml` 自動 build Win/Linux/macOS 並建 GitHub Release（含 SHA256 / VirusTotal；macOS 於 `macos-latest` 上產出未簽名 dmg/zip）。
- 手機測試：`cd mobile && npm test`（純邏輯，免模擬器）；實機需 `expo run:ios` 或 EAS build（需 macOS 或 Expo 帳號）。
- CI：`.github/workflows/ci.yml` 對 main 的 PR/push 跑手機版核心測試。

## 開發慣例

- 提交與 PR 訊息用繁體中文。功能分支 `claude/<topic>`，PR 合併用 squash。
- repo 已開啟 Allow auto-merge：PR 可掛「等 CI 過自動併」。
- 不要把模型識別字串寫進 commit / PR / 程式碼。
- 最終 iOS 編譯/簽署只能在 macOS 或 EAS（本開發容器為 Linux，無法跑 Xcode / GUI 視覺驗證）。

## 近期重點（v1.5.0）

桌面版品質升級：修音效 AudioContext 洩漏、補齊通知/托盤/水杯多語、消除設定開關閃爍、數值輸入 clamp、多螢幕水杯定位、週圖對齊 7 天；UI 加本地字型、達標慶祝、可及性（鍵盤/aria）、主題化確認框。詳見 `CHANGELOG.md`。

## 已知約束 / 注意

- UI 視覺改動無法在 Linux 容器驗證，發版前建議在 Windows/macOS `npm start` 冒煙（切 4 語 × 5 主題 × 5 杯款 + 喝滿/碎裂/達標）。
- GNOME 需 AppIndicator 擴充才顯示托盤；透明水杯需桌面合成。
- 手機通知須實機測試；iOS 64 則待發上限以滾動預排因應。

## 待辦

- **macOS 簽署 + 公證**：目前 `release.yml` 的 `build-mac` 設 `CSC_IDENTITY_AUTO_DISCOVERY=false`，出的是**未簽名版**，使用者首次開啟需在「系統設定 → 隱私權與安全性」放行。若要正式簽署 + 公證（notarize），需在 repo Secrets 加：
  - `CSC_LINK`（base64 的 Developer ID Application `.p12`）、`CSC_KEY_PASSWORD`（憑證密碼）
  - Apple notarize 所需：`APPLE_ID`、`APPLE_APP_SPECIFIC_PASSWORD`、`APPLE_TEAM_ID`
  - 並在 build 設定開啟 `mac.notarize` / hardened runtime + entitlements，移除上述 `CSC_IDENTITY_AUTO_DISCOVERY=false`。
