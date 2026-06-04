# 喝水提醒 — 同步後端

讓**桌面版**與**手機版**的飲水資料跨裝置連動。零外部 npm 依賴，只用 Node 22 內建的
`node:sqlite` / `node:http` / `node:crypto`。認證採**裝置配對碼**（無 email / 密碼）。

## 運作原理

- 每台裝置只回報「**自己**」的每日飲水貢獻（`{date: {ml, cups}}`）。
- 伺服器把同一帳號下**各裝置依日期加總**後回傳。
- 裝置端顯示 = 自己 + 其他裝置（讀取時疊加）。
- 因此多裝置就算各自離線記錄，同步後**既不會重複計數也不會掉資料**。
- 設定（間隔、目標…）以時間戳 **last-write-wins** 合併。

合併演算法與資料 schema 與前端共用同一份程式（`../shared/`），伺服器只負責儲存與加總。

## 本機跑

```bash
cd server
npm start            # 預設聽 :8787，DB 存 server/data.sqlite
PORT=9000 DB_PATH=/tmp/d.sqlite npm start
```

## 測試

```bash
cd server && npm test    # 起真伺服器 + 真 SyncClient 跑端到端
```

## Docker（自部署）

build context 要在 **repo 根目錄**（因為要帶入 `shared/`）：

```bash
docker build -f server/Dockerfile -t drinkwater-sync .
docker run -d -p 8787:8787 -v drinkwater-data:/data --name drinkwater-sync drinkwater-sync
```

或用 compose：

```bash
docker compose -f server/docker-compose.yml up -d
```

部署到 Fly.io / Railway / 任何 VPS 皆可；對外請擺在 HTTPS 反向代理（Caddy/Nginx）後面，
裝置端填的 server URL 用 `https://你的網域`。

## API

| 方法 / 路徑 | body | 回傳 |
|---|---|---|
| `GET /health` | — | `{ok:true}` |
| `POST /api/pair/create` | `{deviceId, token?}` | `{token, code}`（6 位配對碼，10 分鐘有效）|
| `POST /api/pair/claim` | `{deviceId, code}` | `{token}` |
| `POST /api/sync` | `{deviceId, token, contrib, settings, settingsUpdatedAt}` | `{aggregate, settings, settingsUpdatedAt}` |

`token` 即帳號憑證，請當機密保存（存在各裝置本機）。配對碼為一次性、短效。

## 資料表

`accounts` / `devices` / `contributions(device_id,date)` / `pairings(code)`。
超過 14 天的舊貢獻會在同步時自動清除，避免無限成長。
