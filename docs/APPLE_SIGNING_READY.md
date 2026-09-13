# macOS 簽署＋公證：從 Developer Program 會籍到 CI 出貨

程式碼與 CI 已經改好（`package.json` `build.mac`、`build/entitlements.mac.plist`、`release.yml`），
剩下的是**只有帳號持有人能做的事**：建憑證、產 App 專用密碼、把秘密放進 GitHub。依序做完 1–6 即可。
**全程在 Windows 完成，不需要 Mac**：憑證用 Git Bash 的 OpenSSL 產，簽署與公證在 GitHub 的 macOS runner 上跑。

> 前提：你是該 Apple Developer 帳號的 **Account Holder**（Developer ID 憑證只有這個角色能建）。

---

## 1. 查 Team ID，填進 `package.json`

[developer.apple.com/account](https://developer.apple.com/account) → **Membership details** → **Team ID**（10 碼英數）。

本專案已填：`package.json` `build.mac.notarize.teamId` = `24AD9R4PQ2`（2026-09-14）。換帳號時改這裡。
Team ID 不是秘密（每個簽署後的 App 都看得到），放 repo 沒關係。

> 為什麼不放 secret：本專案 electron-builder 是 24.x，**不讀 `APPLE_TEAM_ID` 環境變數**；而且 `notarize: true` 這種寫法會走不帶 teamId 的舊路徑，被 `@electron/notarize` 2.x 以「teamId is required」擋下。所以只能用 `{ "teamId": "…" }` 物件形式。CI 有檢查：placeholder 沒換會直接紅燈。

## 2. 產生 CSR（憑證請求檔）— Windows，Git Bash（內建 OpenSSL，不需 Mac）

```bash
mkdir -p ~/apple-signing && cd ~/apple-signing
openssl genrsa -out developerid.key 2048
MSYS_NO_PATHCONV=1 openssl req -new -key developerid.key -out developerid.certSigningRequest \
  -subj "/emailAddress=<你的 Apple ID email>/CN=Drink Water Reminder/C=TW"
openssl req -in developerid.certSigningRequest -noout -subject   # 應印出 subject=emailAddress=…, CN=…, C=TW
```
`MSYS_NO_PATHCONV=1` 必加：Git Bash 會把 `-subj` 開頭的 `/` 轉成 `C:/Program Files/Git/`，openssl 報 `subject name is expected to be in the format`。
`developerid.key` 是私鑰，**之後匯出 .p12 要用，別刪**。

## 3. 在 Apple 建 Developer ID Application 憑證

[Certificates, Identifiers & Profiles → Certificates](https://developer.apple.com/account/resources/certificates/list) → **+** → Software 區選 **Developer ID** → Continue → 選 **Developer ID Application** → 上傳步驟 2 的 `.certSigningRequest` → Continue → **Download**，得到 `developerID_application.cer`。

（每個帳號最多 5 張 Developer ID Application 憑證；憑證效期 5 年。）

## 4. 匯出 `.p12`（憑證＋私鑰）— Windows，承步驟 2

先下載 Apple 中繼憑證 [DeveloperIDG2CA.cer](https://www.apple.com/certificateauthority/DeveloperIDG2CA.cer) 到同目錄，然後：
```bash
cd ~/apple-signing
openssl x509 -inform der -in developerID_application.cer -out developerid.pem
openssl x509 -inform der -in DeveloperIDG2CA.cer -out DeveloperIDG2CA.pem
openssl pkcs12 -export -legacy \
  -inkey developerid.key -in developerid.pem -certfile DeveloperIDG2CA.pem \
  -out developerid.p12
```
會問 Export Password，設一組（＝`CSC_KEY_PASSWORD`）。
`-legacy` 是必要的：OpenSSL 3 預設的 p12 加密方式 macOS 的 `security import` 不一定吃，CI 上會匯入失敗。

驗一下裡面真的有憑證＋私鑰（不會印出私鑰內容）：
```bash
openssl pkcs12 -legacy -in developerid.p12 -nokeys -clcerts | openssl x509 -noout -subject
# 預期看到 subject 含 "Developer ID Application: … (<Team ID>)"
```

## 5. 產 App 專用密碼（給 notarytool 登入）

[account.apple.com](https://account.apple.com) → 登入與安全性 → **App 專用密碼** → 產生一組（名稱任填，例如 `drinkmorewater-notarize`）→ 記下 `xxxx-xxxx-xxxx-xxxx`。
這組密碼只顯示一次；要用的 Apple ID 必須是**開發者帳號本人**（Account Holder）。

## 6. 設定 GitHub repo secrets

需要 4 個。**不要把 .p12 的 base64 貼到任何對話或 issue**，直接用 `gh` 從檔案餵：

```powershell
# PowerShell（Windows）
cd ~\apple-signing
[Convert]::ToBase64String([IO.File]::ReadAllBytes("developerid.p12")) | Set-Content -NoNewline csc_link.txt
gh secret set CSC_LINK --repo nyannyn/drinkmorewater < csc_link.txt
gh secret set CSC_KEY_PASSWORD --repo nyannyn/drinkmorewater            # 貼 .p12 密碼
gh secret set APPLE_ID --repo nyannyn/drinkmorewater                    # 貼開發者帳號 email
gh secret set APPLE_APP_SPECIFIC_PASSWORD --repo nyannyn/drinkmorewater # 貼步驟 5 的密碼
Remove-Item csc_link.txt
gh secret list --repo nyannyn/drinkmorewater
```

| Secret | 內容 | 用途 |
|---|---|---|
| `CSC_LINK` | `.p12` 的 base64（單行） | electron-builder 匯入憑證簽署 |
| `CSC_KEY_PASSWORD` | `.p12` 密碼 | 同上 |
| `APPLE_ID` | 開發者帳號 email | notarytool 登入 |
| `APPLE_APP_SPECIFIC_PASSWORD` | App 專用密碼 | notarytool 登入 |

`.p12` 與 `.key` 之後請收進密碼管理器並從 Downloads / `~/apple-signing` 刪除；弄丟了就到 Apple 後台 revoke 再重做步驟 2–4。

---

## 7. 乾跑驗證（不打 tag、不建 Release）

```bash
# --ref 要指向「含 workflow_dispatch 的 release.yml」所在分支：PR #32 merge 前是 claude/macos-signing，merge 後才是 main
gh workflow run release.yml --repo nyannyn/drinkmorewater --ref claude/macos-signing
gh run watch --repo nyannyn/drinkmorewater
```
只會跑 `build-mac`。要看的是「**驗證簽署與公證**」步驟綠燈，代表每個 `.app` 都：
- `codesign`：`Authority=Developer ID Application: …`
- `xcrun stapler validate`：公證票已釘上
- `spctl -a`：`source=Notarized Developer ID`

（沒有 Mac 可以實測安裝，上面三項 CI 驗證就是全部證據；之後有 Mac 使用者回報「打不開」再查。）

常見失敗：
- `security: SecKeychainItemImport … MAC verification failed` → .p12 不是 `-legacy` 產的，回步驟 4 重做。
- `unable to build chain to self-signed root` → .p12 少了中繼憑證，步驟 4 的 `-certfile` 漏了。
- `Invalid credentials` / `HTTP status code: 401` → App 專用密碼錯或不是 Account Holder 的 Apple ID。
- `teamId is required` → 步驟 1 沒填。

## 8. 正式發版

```bash
npm version minor   # 或 patch；會改 package.json 並打 tag
git push --follow-tags
```
tag 推上去 → `release.yml` 三平台 build → 簽署＋公證 → 建 GitHub Release。

---

## 完成後清理

- [ ] 憑證檔案收進密碼管理器、刪本機殘留
- [ ] 確認 GitHub Release 頁的 macOS 說明已是「已簽署公證」（`release.yml` 已改，看實際 Release 頁一眼）
- [ ] 本檔可留作日後憑證到期（5 年）換發的 SOP
