# App Store 送審前 fresh-context 稽核（2026-09-15，commit `3074880`）

分支 `claude/ios-store-screenshots`；以下每列的「證據」都可重跑或可直接點開對應行號覆核，不憑印象填寫。

| # | 檢查項（指引條號） | 證據 | 判定 | 建議修正 |
|---|---|---|---|---|
| 1 | 2.1 App 完整性／冷啟動不閃退 | 本分支 commit `0b02a61` 的 CI run `gh run view 34880972228`：三個 job 全綠（build-ios、package-ipa、store-screenshots）。`store-screenshots` 在 iPhone 17 Pro Max（iOS 26 模擬器）冷啟動 9 次（首次寫示範資料＋4 語 × 2 分頁各重啟一次）皆成功，artifact `ios-store-screenshots` 8 張 1320×2868，畫面內容經人工檢視為對應語言的 Home／設定頁（`docs/store/baseline-2026-09-15.md` 為改動前對照）。 | 通過 | — |
| 2 | 5.1.1 權限 | `mobile/app.json:19` `NSUserNotificationsUsageDescription` = 「用於在喝水時間提醒你補充水分。」句意清楚。拒絕權限後不擋畫面：`mobile/App.tsx:81-86` 拒絕只 `console.warn`，接著仍執行 `resetDailyIfNeeded/reschedule/doSync/setReady(true)`（`App.tsx:87-90`），`ready` 為 true 後一律渲染 Home/Settings（`App.tsx:147-178`），無權限專屬擋頁。 | 通過 | — |
| 3 | 隱私 manifest | `mobile/app.json:24-53` 有 `privacyManifests`（4 個 `NSPrivacyAccessedAPIType` + 空 `NSPrivacyCollectedDataTypes` + `NSPrivacyTracking:false`），`npx expo config --type public --json`（於 `mobile/`）可正確解析、無報錯。三個相依套件均已內建 `PrivacyInfo.xcprivacy`：`mobile/node_modules/@react-native-async-storage/async-storage/ios/PrivacyInfo.xcprivacy`、`mobile/node_modules/expo-notifications/ios/PrivacyInfo.xcprivacy`、`mobile/node_modules/expo-device/ios/PrivacyInfo.xcprivacy`。 | 通過 | 靜態設定無誤，但 prebuild 對「有無產生 `ios/app/PrivacyInfo.xcprivacy`」的斷言（`.github/workflows/ios.yml:59`）在本 commit 尚未跑過綠燈（見第 1 項），建議等該 CI 綠燈作最終確認。 |
| 4 | Launch screen | `mobile/app.json:65-74`：`plugins` 內同時有裸字串 `"expo-splash-screen"`（line 65）與帶設定的陣列形式（line 66-74，image/resizeMode/backgroundColor/imageWidth）。`npx expo config --type public` 執行 exit 0、無 stderr 警告，設定可正常解析。 | 通過 | 兩個 `expo-splash-screen` 項重複（line 65 與 66-74），非必要、易誤讀，建議移除裸字串那筆（line 65），保留有設定的版本即可。 |
| 5 | 出口合規 | `mobile/app.json:22` `ios.config.usesNonExemptEncryption = false`。 | 通過 | — |
| 6 | iPad | `mobile/app.json:14` `ios.supportsTablet = false`（App Store Connect 上架時列為僅 iPhone，非缺陷）。 | 通過 | — |
| 7 | 4.2 最小功能 | Home（`mobile/src/screens/HomeScreen.tsx`）：水杯進度圖＋喝水按鈕＋每週長條圖。Settings（`mobile/src/screens/SettingsScreen.tsx`）：提醒開關（40-43）、間隔選擇（46-59）、活躍時段輸入（62-81）、每日目標（85-92）、每次飲水量（95-106）、4 語言切換（109-121）、音效開關（124-127）、跨裝置同步區塊（130，見 `SyncSection.tsx`）、測試通知（134-136）、重設（138-140）。多個獨立功能面，非純網頁殼或單一功能包裝。 | 通過 | — |
| 8 | 隱私權政策網址 | `curl -sI https://nyannyn.github.io/drinkmorewater/privacy.html` → `HTTP/1.1 200 OK`。該網址與 `docs/IOS_RELEASE.md:100` 記載的送審用網址一致，對應本 repo `docs/privacy.html`。 | 通過 | — |
| 9 | App 內對外連結 | `grep -rn "Linking.openURL\|https://" mobile/src mobile/App.tsx` 僅命中 `mobile/src/screens/SyncSection.tsx:101` 的 `TextInput` placeholder 文字 `"https://your-server"`（使用者自填欄位提示，非可點連結）。App 內無 `Linking.openURL` 呼叫、無任何會實際開啟的外部網址。 | 通過 | — |
| 10 | 同步功能／3.1／5.1.2 | `mobile/src/screens/SyncSection.tsx` 只呼叫 `../core/sync` 包裝的 `shared/sync-client.js`；`sync-client.js:65-77` 的 `_api()` 只打呼叫方傳入的 `serverUrl`（使用者自填，`SyncSection.tsx:97-105`），無任何寫死的第三方端點。`grep -in "訂閱\|付費\|purchase\|subscription\|IAP" mobile/src -r` 零命中。 | 通過 | — |
| 11 | 2.3 Metadata 風險 | `grep -in "demo\|beta\|測試版\|試用" mobile/src/i18n.ts` 僅命中 `testNotif: "傳送測試通知"`（設定頁的「傳送測試通知」按鈕標籤，屬正常功能非未完成標記）。截圖模式旗標 `EXPO_PUBLIC_SCREENSHOT`（`mobile/App.tsx:77`）只在明確設為 `"1"` 時略過權限請求並寫入示範資料；一般 build 未設該環境變數，走正常 `requestPermissions()` 流程（`App.tsx:81`）。 | 通過 | — |
| 12 | 版本資訊 | `mobile/app.json:5` `version = "1.5.0"`；`mobile/app.json:16` `ios.buildNumber = "1"`（僅記錄，不判斷）。 | 通過 | — |

## 需修項目

無（#1 於 2026-09-15 補驗：稽核當下 run 34875417172 仍在跑，agent 誤把 UTC 時間戳讀成「卡住 24 小時」；後續 run 34880972228 全綠，證據已更新至表格）。
