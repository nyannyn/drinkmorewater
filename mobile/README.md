# 💧 喝水提醒 — iOS 手機版（React Native / Expo）

桌面版（Electron）的手機分身,核心訴求是**原生本地排程通知**:由 iOS 作業系統在指定時間喚起提醒,App 不需在前景或背景常駐執行。

> 技術選型:**Expo + `expo-notifications`**。Expo 即 React Native;其本地排程通知在 iOS 最穩定,且支援通知動作鈕與權限流程,並可用雲端 EAS Build 在沒有 Mac 的情況下產生 iOS build。

## 為什麼不是照搬桌面的 setTimeout

桌面版靠常駐主行程的 `setTimeout` 計時。手機一進背景,JS timer 幾秒內就被系統凍結,因此改為:

**預先算出未來一批提醒時間點 → 一次性交給 OS 排程**(`src/core/schedule.ts` + `src/notifications/notify.ts`)。App 每次進前景時重排,補上背景期間消耗掉的通知。iOS 同時最多 64 則待發通知,故預設只排未來 48 小時、上限 60 則。

## 功能對照（桌面 → 手機）

| 桌面 (Electron) | 手機 (Expo) | 檔案 |
|---|---|---|
| `setTimeout` 計時 | OS 預排本地通知 | `src/notifications/notify.ts` |
| 系統托盤常駐 | App + 排程通知(免常駐) | — |
| `powerMonitor` 鎖屏暫停 | 活躍時段設定(此區間外不發) | `src/core/schedule.ts` |
| 原生 `Notification` | 本地通知 + 「我喝了」動作鈕 | `notify.ts` |
| `userData/data.json` | AsyncStorage | `src/core/storage.ts` |
| 跨日重設 / 統計 | 同邏輯移植 | `src/core/tracking.ts` |

## 專案結構

```
mobile/
├── App.tsx                     # 入口:權限、通知回應監聽、進前景重排
├── app.json                    # Expo 設定(iOS bundleId、通知 plugin、權限文案)
├── src/
│   ├── core/                   # 平台無關純邏輯（可單元測試）
│   │   ├── types.ts            # 資料 schema(沿用桌面鍵名)
│   │   ├── storage.ts          # AsyncStorage 持久化
│   │   ├── tracking.ts         # 跨日重設、記錄喝水、每週統計
│   │   ├── schedule.ts         # 提醒時間點計算(活躍時段、64 則上限)
│   │   └── __tests__/          # node:test 單元測試
│   ├── notifications/notify.ts # 權限、通知類別、排程/取消
│   ├── components/             # Cup（水位動畫）、WeeklyChart
│   ├── screens/                # HomeScreen、SettingsScreen
│   └── i18n.ts
└── assets/icon.png
```

## 開發 / 執行

需 Node 18+。

```bash
cd mobile
npm install
npm test            # 跑核心排程邏輯單元測試(不需模擬器)
```

> ⚠️ **本地通知必須在實機(或開發 build)測試**。Expo Go 對排程通知支援受限,且模擬器收不到通知。請用開發 build:

```bash
# 需 macOS + Xcode
npx expo run:ios

# 或免 Mac,用雲端建置(需 Expo 帳號)
npx eas build --platform ios --profile development
```

## 打包上架（App Store / TestFlight）

最終的 iOS 編譯、簽署、上傳**必須在 macOS 或 EAS 雲端**完成(本 repo 的開發容器為 Linux,無法跑 Xcode):

```bash
# 雲端建置正式版(需 Apple 開發者帳號 $99/年)
npx eas build --platform ios --profile production
npx eas submit --platform ios
```

`ios/` 原生資料夾由 `npx expo prebuild` 產生,已列入 `.gitignore`(不入庫)。

## iOS 通知注意事項

- **權限**:首次啟動會彈出系統授權窗;拒絕後需到「設定 → 喝水提醒 → 通知」手動開啟。
- **64 則上限**:超過會被系統丟棄,故採滾動預排策略。
- **動作鈕**:長按 / 下拉通知可見「我喝了 💧」,點了不開 App 即記錄並重排下一輪。
- **勿擾模式 / 專注模式**:使用者層級的勿擾仍會壓制通知,屬預期行為。
