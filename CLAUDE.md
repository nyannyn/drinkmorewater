# CLAUDE.md — 專案記憶

> 喝水提醒 Drink Water Reminder。給 Claude / 開發者快速掌握此 repo 的脈絡。
> Repo: `nyannyn/drinkmorewater`

## 一句話

定時提醒喝水、追蹤每日 / 每週飲水量。原為 Chrome 擴充，現為 **Electron 桌面版**（Windows / Linux / macOS），並有 **iOS 手機版**（React Native / Expo，原生本地排程通知）。

## 兩個應用 + 共用層

| | 桌面版 | 手機版 |
|---|---|---|
| 技術 | Electron 31，vanilla HTML/CSS/JS | React Native / Expo **SDK 57**（TypeScript，New Architecture）|
| 位置 | `electron/` + `renderer/` | `mobile/` |
| 提醒機制 | 主行程 `setTimeout` 計時 | `expo-notifications` 預排 OS 本地通知 |
| 狀態 | 已發行（release.yml 出 Win/Linux/macOS）| 尚未上架（需 macOS / EAS build）|

兩端共用 **`shared/`**（跨平台純邏輯）與選用的 **`server/`**（自架同步後端），達成桌面↔手機資料連動。

## 共用 core（shared/）

跨平台純函式，CommonJS + JSDoc，**桌面 `require()`、手機 metro / `node:test` 皆直接使用、免 build**。

- `schema.js` — 資料 schema 單一真相來源（DEFAULTS、常數、`SETTINGS_KEYS`）。手機 `mobile/src/core/types.ts` re-export 之；桌面直接吃。
- `tracking.js` — 跨日重設 / 記錄喝水 / 週統計（純函式，不碰 I/O；兩端各自以儲存層包裝）。
- `merge.js` — **同步合併演算法**：各裝置回報自身每日貢獻 → 伺服器依日期加總 → 顯示 = own + others；設定 last-write-wins。
- `sync-client.js` — 平台無關同步客戶端（全域 fetch + 注入式儲存）。採「疊加層」：本機追蹤欄位仍只記自己，他機貢獻另存，顯示時相加，故離線行為不變。
- 手機 import 須帶 `.js` 副檔名（ESM 解析）；metro 靠 `mobile/metro.config.js` 的 watchFolders 納入 shared。
- 測試：`node --test shared/__tests__/*.test.js`（20 項）。

## 同步後端（server/）

- Node 22 內建 `node:sqlite` / `node:http` / `node:crypto`，**零 npm 依賴**。認證採**裝置配對碼**（無帳號）。
- API：`/api/pair/create`（產碼）、`/api/pair/claim`（加入）、`/api/sync`（推貢獻+設定、拉加總）。
- 部署：`server/Dockerfile` + `docker-compose.yml`（build context 須在 repo 根，以帶入 `shared/`）。
- 測試：`cd server && npm test`（起真伺服器 + 真 client 跑兩裝置全流程，7 項）。
- 連動操作：桌面設定頁「偏好 → 跨裝置同步」、手機設定頁「跨裝置同步」區塊，填伺服器網址後產碼 / 輸入碼。

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
- 發版：推 tag `v*` → `.github/workflows/release.yml` 自動 build Win/Linux/macOS 並建 GitHub Release（含 SHA256 / VirusTotal）。macOS 以 Developer ID **簽署＋公證**，並在 job 內以 `codesign` / `stapler validate` / `spctl` 驗證正向證據（缺 secrets 直接紅燈，不會靜默出貨未簽名版）。`workflow_dispatch` 手動觸發＝只跑 build-mac 乾跑、不建 Release，用來在打 tag 前驗憑證。憑證建立與 secrets 設定見 `docs/APPLE_SIGNING_READY.md`。
- 手機測試：`cd mobile && npm test`（純邏輯，免模擬器）＋ `npx tsc --noEmit`（型別閘，含測試檔）＋ `npx expo-doctor`；實機需 `expo run:ios` 或 EAS build（需 macOS 或 Expo 帳號）。
- **iOS 上架走 EAS Build＋Submit**，但憑證／ASC API key／版號都留在自己手上（可攜性契約與完整 SOP 見 `docs/IOS_RELEASE.md`）；`eas.json` `appVersionSource: local`，不用 expo-updates。
- CI：`.github/workflows/ci.yml` 對 main 的 PR/push 跑 **shared 純函式 + server 端到端 + 手機版核心** 三組測試。
- 同步後端：`cd server && npm start`（本機）或 Docker 部署；連動需先有可達的伺服器網址（HTTPS）。
- **iOS 雲端 build：`.github/workflows/ios.yml`（`macos-latest`）**。本 repo 為公開 → GitHub 託管 macOS runner **免費、無額度上限**（私有則 macOS 以 10× 扣額度）。流程：`npm install` → 核心測試 → `expo prebuild` → Xcode 編譯**未簽署 Release（iOS Simulator）** → 開模擬器、啟動、用 idb 點掉通知權限框、截圖上傳成 artifact `ios-simulator-screenshots`。整條不需 Apple 憑證，純驗證 build 鏈 + 看畫面用。一輪約 12–15 分。

## 開發慣例

- 提交與 PR 訊息用繁體中文。功能分支 `claude/<topic>`，PR 合併用 squash。
- repo 已開啟 Allow auto-merge：PR 可掛「等 CI 過自動併」。
- 不要把模型識別字串寫進 commit / PR / 程式碼。
- 最終 iOS 編譯/簽署只能在 macOS 或 EAS（本開發容器為 Linux，無法跑 Xcode / GUI 視覺驗證）。
- 同步的純邏輯與後端在容器內可完整測試；但桌面 / 手機的同步 **UI 與實機網路連動** 無法在 Linux 容器驗證，需在實際環境冒煙（部署 server → 兩端填網址 → 產碼/加入 → 互看數據）。

## 近期重點（v1.5.0）

桌面版品質升級：修音效 AudioContext 洩漏、補齊通知/托盤/水杯多語、消除設定開關閃爍、數值輸入 clamp、多螢幕水杯定位、週圖對齊 7 天；UI 加本地字型、達標慶祝、可及性（鍵盤/aria）、主題化確認框。詳見 `CHANGELOG.md`。

## 已知約束 / 注意

- UI 視覺改動無法在 Linux 容器驗證，發版前建議在 Windows/macOS `npm start` 冒煙（切 4 語 × 5 主題 × 5 杯款 + 喝滿/碎裂/達標）。
- GNOME 需 AppIndicator 擴充才顯示托盤；透明水杯需桌面合成。
- 手機通知須實機測試；iOS 64 則待發上限以滾動預排因應。
- **Expo SDK 升級注意**（52→57，2026-09）：Apple 自 2026-04-28 起要求 Xcode 26 / iOS 26 SDK，Expo SDK 54+ 的 EAS 預設映像才有 Xcode 26。SDK 57 起 `babel-preset-expo` 要明列 devDependency（否則 metro 報 `Cannot find module 'babel-preset-expo'`）、`app.json` 頂層 `splash` 已移除改用 `expo-splash-screen` plugin、`@types/react` 要跟 React 19。`expo prebuild --platform ios` 在 Windows 不可用（WSL 可）。
- **iOS Release 打包需 `expo-asset` 相依**（已補進 `mobile/package.json`）。Release 的「Bundle React Native code and images」階段會跑 `expo export:embed`，缺 expo-asset 會報 `The required package expo-asset cannot be found`（exit 65）；Debug 不打包 JS 故不踩此雷。
- iOS 模擬器要截到 Home 畫面，須先點掉啟動時的通知權限框：`App.tsx` 一掛載即 `requestPermissions()`，未回應前畫面停在 loading。CI 用 `idb ui tap` 找「Allow/允許」按鈕座標點掉（`xcrun simctl privacy` 不支援授予通知權限）。
- **macOS 公證的 Team ID 寫在 `package.json` `build.mac.notarize.teamId`（非 secret）**：electron-builder 24.x **不讀 `APPLE_TEAM_ID` 環境變數**，且 `notarize: true` 走的是不帶 teamId 的舊路徑，會被 `@electron/notarize` 2.x 以「teamId is required」擋下——所以必須用物件形式 `{ "teamId": "…" }`。若升級 electron-builder 到 26+ 才可改用環境變數。

## 待辦

- **iOS 上架**：程式面已就緒（SDK 57、`eas.json`、隱私權頁）；剩帳號持有人動作：ASC 建 App 記錄＋API key、`eas login/init/build/submit`、備份憑證、上架資料——照 `docs/IOS_RELEASE.md`。`eas.json` 的 `ascAppId` 仍是 placeholder。
