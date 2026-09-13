# iOS 上架 SOP：EAS Build 出貨，但憑證與版號留在自己手上

沒有 Mac 也能完成。EAS（Expo 的雲端 build 服務）只當「可替換的 build 工人」；
下面第一節的**可攜性契約**保證日後要搬到自架 CI（GitHub Actions macOS runner）時不必重來。

---

## 0. 可攜性契約（避免被 EAS 鎖定）

| 項目 | 本專案的做法 | 為什麼 |
|---|---|---|
| **簽署憑證** | EAS 第一次 build 會代建 Distribution Certificate＋Provisioning Profile；建好後**立刻下載備份**（步驟 5） | 檔案在你手上，任何 CI 都能用；不備份＝離開 EAS 要 revoke 重發 |
| **上傳金鑰** | 用你自己在 App Store Connect 建的 **API Key（.p8）**，以指令參數餵給 `eas submit`（步驟 2、6） | 同一把 key 也給 fastlane／iTMSTransporter 用；不用 Apple ID 密碼式上傳 |
| **版號來源** | `eas.json` 設 `appVersionSource: "local"`，`version`／`buildNumber` 寫在 `app.json` 隨 git 走 | `remote` 模式版號存在 Expo 伺服器，搬家帶不走 |
| **OTA 更新** | **不用** `expo-updates`／EAS Update | 這才是真正的鎖定面；本 App 沒有用，維持不用 |
| **原生專案** | `ios/` 不入庫，任何時候 `npx expo prebuild` 重生；`.github/workflows/ios.yml` 已在 GitHub 免費 macOS runner 驗過整條 build 鏈 | 退出 EAS 時只需把憑證放 GitHub secrets、在 `ios.yml` 加簽署＋上傳 job（fastlane `match`/`pilot` 或 `xcodebuild -exportArchive`＋iTMSTransporter） |
| **EAS 專屬欄位** | `eas init` 會在 `app.json` 寫 `extra.eas.projectId`；`eas.json` 整檔 | 兩者都是純標記，不影響 `expo prebuild`，離開時刪掉即可 |

> 為什麼不現在就走自架 CI：iOS 簽署要 Distribution Cert＋Profile＋App Store Connect 記錄三件事對齊，EAS 第一次會互動式幫你全建好；自己做要在沒有 Mac 的情況下手工做 CSR／profile 配對，錯一步 debug 成本很高。先讓 EAS 建，把成品備份下來，之後要搬就是「把檔案放 secrets」的事。

---

## 1. App Store Connect：建 App 記錄

[appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **Apps → +** → New App：
- Platform：iOS
- Name：喝水提醒（App Store 顯示名稱，全球唯一，被佔用就加後綴）
- Primary language：Chinese (Traditional)
- Bundle ID：先到 [developer.apple.com → Identifiers](https://developer.apple.com/account/resources/identifiers/list) → **+** → App IDs → App → Explicit `com.drinkmorewater.app`（與 `mobile/app.json` 一致）、Capabilities 全部不勾（本 App 只用本地通知，不需 Push Notifications）
- SKU：`drinkmorewater-ios`

建好後在 App Information 頁抄 **Apple ID**（純數字），填進 `mobile/eas.json` 的 `submit.production.ios.ascAppId`（取代 `REPLACE_WITH_ASC_APP_ID`）並 commit。

## 2. App Store Connect API Key（上傳用，自己保管）

App Store Connect → **Users and Access → Integrations → App Store Connect API → Team Keys → +**
- Name：`drinkmorewater-ci`
- Access：**App Manager**
- 下載 `AuthKey_<KEY_ID>.p8`（**只能下載一次**），同頁抄 **Key ID** 與 **Issuer ID**

三樣東西收進密碼管理器。這把 key 之後給 EAS、fastlane、任何 CI 都通用。

## 3. Expo 帳號與 EAS CLI（在你的真終端機，不能由 Claude 代跑）

```powershell
npm install -g eas-cli
cd C:\Users\Ella\Downloads\drink\mobile
eas login            # 沒帳號先到 expo.dev 註冊（免費方案即可）
eas init             # 建 EAS project，會把 extra.eas.projectId 寫進 app.json → commit 它
```

## 4. 第一次 build（EAS 代建憑證）

```powershell
eas build --platform ios --profile production
```
互動流程會問：
1. 「Do you want to log in to your Apple account?」→ **Yes**，登入開發者帳號（Account Holder）
2. 「Generate a new Apple Distribution Certificate?」→ **Yes**
3. 「Generate a new Apple Provisioning Profile?」→ **Yes**

之後排隊＋build 約 15–30 分（免費方案排隊較久）。完成後 expo.dev 的 build 頁可下載 `.ipa`。

失敗時先看 build log 的 **Xcode 段**；本 repo 的 `ios.yml` 在 GitHub macOS runner 已驗過同一份原生專案能編譯，若 EAS 炸而 `ios.yml` 綠，問題多半在憑證／profile 對不上 bundle id。

## 5. 立刻備份憑證（可攜性契約第 1 條）

```powershell
eas credentials --platform ios
```
選 **production** → 會列出 Distribution Certificate 與 Provisioning Profile → 選 **Download** 各存一份（`.p12` 會問密碼，自己設）。連同密碼收進密碼管理器。
也可在 expo.dev → Project → Credentials 頁下載。

## 6. 送 TestFlight

```powershell
eas submit --platform ios --profile production --latest `
  --asc-api-key-path C:\path\to\AuthKey_XXXXXXXXXX.p8 `
  --asc-api-key-id XXXXXXXXXX `
  --asc-api-key-issuer-id xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```
（它會問要不要把 key 存到 EAS 以後免打——存不存都可以，主本在你手上。）
幾分鐘後 App Store Connect → TestFlight 出現 build（第一次會要回答「出口合規」，`app.json` 已宣告 `usesNonExemptEncryption: false`，通常自動帶過）。

**TestFlight 實機測試清單**（裝 TestFlight App → 安裝）：
- [ ] 首次啟動允許通知後，到提醒時間真的收到通知（把間隔調 1 分鐘測）
- [ ] 通知上的「我喝了」動作鈕按下去，開 App 看紀錄有加
- [ ] App 關閉（不只是背景）後通知照樣來
- [ ] 跨日（改系統時間到隔天）今日歸零、週圖多一天
- [ ] 切 4 種語言，通知文字跟著變
- [ ] 跨裝置同步：填桌面版同一台伺服器＋配對碼，兩邊數字互看

## 7. 上架資料（App Store Connect → App → 版本頁）

> 前提：PR #33 已 merge 進 `main`。隱私權政策網址由 GitHub Pages 從 `main` 的 `docs/` 提供，merge 前那個網址是 404，App Store Connect 會驗證網址能開。

| 欄位 | 填什麼 |
|---|---|
| 截圖 | **6.9 吋 iPhone 必填**（`app.json` 已設 `supportsTablet: false`，只上 iPhone，不需 iPad 截圖；日後要支援 iPad 改回 `true` 重 build 即可） |
| 隱私權政策網址 | `https://nyannyn.github.io/drinkmorewater/privacy.html`（本 repo `docs/privacy.html`，中英雙語，已寫好） |
| App Privacy 問卷 | 「Do you collect data from this app?」→ **No**（本 App 零收集；跨裝置同步是使用者自架伺服器，不屬開發者收集） |
| 分類 | Health & Fitness |
| 年齡分級 | 問卷全部 None → 4+ |
| 描述／關鍵字／宣傳文字 | 可從 `docs/index.html` 與 `README.md` 的中英文介紹改寫；關鍵字建議：喝水,提醒,飲水,水杯,health,water,reminder,hydration |
| 支援網址 | `https://github.com/nyannyn/drinkmorewater/issues` |
| 版權 | `2026 nyannyn` |

選剛才 TestFlight 那個 build → **Add for Review → Submit**。審核通常 1–3 天。

## 8. 之後每次改版

1. 改 `mobile/app.json`：`version`（使用者看到的，如 1.5.1）與 `ios.buildNumber`（每次上傳必須遞增，如 "2"）→ commit
2. `eas build --platform ios --profile production`（憑證已在，不再互動）
3. `eas submit ...`（同步驟 6）
4. App Store Connect 建新版本、選 build、送審

---

## 附：離開 EAS 的具體步驟（真要搬時再看）

1. 把步驟 5 備份的 `.p12`＋密碼、`.mobileprovision`，以及步驟 2 的 `.p8`／Key ID／Issuer ID 放進 GitHub secrets
2. `ios.yml` 加一個 job：`expo prebuild` → 匯入憑證到臨時 keychain → `xcodebuild -archive` → `-exportArchive`（`method: app-store-connect`）→ `xcrun iTMSTransporter` 或 fastlane `pilot` 上傳
3. 刪 `eas.json`、`app.json` 的 `extra.eas`
4. 版號本來就在 repo，什麼都不用改
