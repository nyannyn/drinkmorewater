# 取得 Apple Developer ID 後的設定步驟

當你拿到 Apple Developer ID 後，依序做以下三件事即可恢復正式 macOS 下載。

---

## 1. GitHub Repo Secrets 加入以下項目

| Secret 名稱 | 內容 |
|---|---|
| `CSC_LINK` | `.p12` 憑證檔的 base64（`base64 -i cert.p12 \| pbcopy`） |
| `CSC_KEY_PASSWORD` | `.p12` 的密碼 |
| `APPLE_ID` | 你的 Apple ID email |
| `APPLE_APP_SPECIFIC_PASSWORD` | 於 appleid.apple.com 產生的 App 專用密碼 |
| `APPLE_TEAM_ID` | 開發者團隊 ID（10 碼英數） |

---

## 2. 修改 `package.json`（build.mac 區段）

把目前的：
```json
"mac": {
  "target": [...],
  "icon": "build/icon.png",
  "category": "public.app-category.healthcare-fitness",
  "artifactName": "${name}-${version}-${arch}.${ext}",
  "identity": null
}
```

改成：
```json
"mac": {
  "target": [
    { "target": "dmg", "arch": ["x64", "arm64"] },
    { "target": "zip", "arch": ["x64", "arm64"] }
  ],
  "icon": "build/icon.png",
  "category": "public.app-category.healthcare-fitness",
  "artifactName": "${name}-${version}-${arch}.${ext}",
  "hardenedRuntime": true,
  "gatekeeperAssess": false,
  "entitlements": "build/entitlements.mac.plist",
  "entitlementsInherit": "build/entitlements.mac.plist",
  "notarize": true
}
```

---

## 3. 建立 `build/entitlements.mac.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.allow-dyld-environment-variables</key>
  <true/>
</dict>
</plist>
```

---

## 4. 修改 `.github/workflows/release.yml`（build-mac job）

把目前的：
```yaml
      - run: npm run dist:mac
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # 未設定 Apple 簽署憑證時，關閉自動簽署，產出未簽名版本
          CSC_IDENTITY_AUTO_DISCOVERY: false
```

改成：
```yaml
      - run: npm run dist:mac
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
```

---

## 5. 修改 `docs/index.html`（下載頁 macOS 卡片）

把目前的終端機指令卡片換成正常下載按鈕。找到 `id="card-mac"` 區塊，整個替換為：

```html
      <div class="dl-card" id="card-mac">
        <div class="icon-box">
          <svg viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79s-2 .77-3.27.82c-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
        </div>
        <h3>macOS</h3>
        <p class="meta">支援 Intel 與 Apple Silicon<br>DMG 安裝映像（已簽署公證）</p>
        <a class="dl-btn" id="btn-mac" href="https://github.com/nyannyn/drinkmorewater/releases/latest" aria-label="下載 macOS 版 Download for macOS">
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span class="btn-label">下載 Download</span>
        </a>
        <a class="dl-alt" href="https://github.com/nyannyn/drinkmorewater/releases">Intel 版 / 歷史版本 All versions →</a>
      </div>
```

並在 JS 區把 macOS 按鈕加回去：
```js
var btnMac = document.getElementById('btn-mac');
var allBtns = [btnWin, btnMac, btnLinux];
var btnOs = { 'btn-win': 'win', 'btn-mac': 'mac', 'btn-linux': 'linux' };
```

fetch 區域加回 macUrl：
```js
var winUrl = null, macUrl = null, linuxUrl = null;
for (var i = 0; i < assets.length; i++) {
  var name = assets[i].name;
  var url = assets[i].browser_download_url;
  if (!winUrl && /setup.*\.exe$/i.test(name) && !/blockmap/i.test(name)) winUrl = url;
  if (/arm64\.dmg$/.test(name)) macUrl = url;
  if (!macUrl && /x64\.dmg$/.test(name)) macUrl = url;
  if (!linuxUrl && /\.AppImage$/i.test(name)) linuxUrl = url;
}
if (winUrl) btnWin.href = winUrl;
if (macUrl) btnMac.href = macUrl;
if (linuxUrl) btnLinux.href = linuxUrl;
```

---

## 6. 刪除此檔案及 CSS 中的 `.mac-cmd` 相關樣式

完成後打 tag 推送，CI 會自動產出已簽署+公證的 DMG。使用者雙擊即可安裝，不需任何 xattr 操作。

---

## 清理項目（完成後記得做）

- [ ] 刪除 `docs/APPLE_SIGNING_READY.md`（本檔案）
- [ ] 移除 `docs/index.html` 中 `.mac-cmd`, `.mac-reason`, `.mac-hint`, `.cmd-block` 的 CSS
- [ ] 移除 `README.md` 中的 xattr 指令（改為「已簽署，直接安裝即可」）
- [ ] 從 `CLAUDE.md` 待辦區移除 macOS 簽署相關項目
