// 喝水提醒同步後端 —— 零 npm 依賴（Node 22 內建 node:sqlite / node:http / node:crypto）。
// 認證：裝置配對碼（無 email/密碼）。一台產生 6 位碼，另一台輸入即加入同一帳號。
// 同步：每台裝置「全量覆蓋自己的每日貢獻」，伺服器把同帳號各裝置依日期加總回傳。

const http = require("node:http");
const crypto = require("node:crypto");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const { aggregateRows } = require("../shared/merge");

const PORT = Number(process.env.PORT) || 8787;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data.sqlite");
const CODE_TTL_MS = 10 * 60 * 1000; // 配對碼 10 分鐘有效
const PRUNE_DAYS = 14; // 超過天數的舊貢獻清掉，避免無限成長

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    settings TEXT NOT NULL DEFAULT '{}',
    settings_updated_at INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS devices (
    device_id TEXT PRIMARY KEY,
    account_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS contributions (
    device_id TEXT NOT NULL,
    account_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    ml INTEGER NOT NULL DEFAULT 0,
    cups INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (device_id, date)
  );
  CREATE TABLE IF NOT EXISTS pairings (
    code TEXT PRIMARY KEY,
    account_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );
`);

const q = {
  accountByToken: db.prepare("SELECT * FROM accounts WHERE token = ?"),
  insertAccount: db.prepare("INSERT INTO accounts (token, settings, settings_updated_at, created_at) VALUES (?, '{}', 0, ?)"),
  updateSettings: db.prepare("UPDATE accounts SET settings = ?, settings_updated_at = ? WHERE id = ?"),
  upsertDevice: db.prepare("INSERT INTO devices (device_id, account_id, created_at) VALUES (?, ?, ?) ON CONFLICT(device_id) DO UPDATE SET account_id = excluded.account_id"),
  deviceById: db.prepare("SELECT * FROM devices WHERE device_id = ?"),
  deleteDeviceContrib: db.prepare("DELETE FROM contributions WHERE device_id = ?"),
  insertContrib: db.prepare("INSERT INTO contributions (device_id, account_id, date, ml, cups) VALUES (?, ?, ?, ?, ?)"),
  accountContrib: db.prepare("SELECT date, ml, cups FROM contributions WHERE account_id = ?"),
  insertPairing: db.prepare("INSERT INTO pairings (code, account_id, expires_at) VALUES (?, ?, ?)"),
  pairingByCode: db.prepare("SELECT * FROM pairings WHERE code = ?"),
  deletePairing: db.prepare("DELETE FROM pairings WHERE code = ?"),
  prunePairings: db.prepare("DELETE FROM pairings WHERE expires_at < ?"),
  pruneOldContrib: db.prepare("DELETE FROM contributions WHERE account_id = ? AND date NOT IN (SELECT date FROM contributions WHERE account_id = ? ORDER BY date DESC LIMIT ?)"),
};

const newToken = () => crypto.randomBytes(24).toString("hex");
const newCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

function createAccount() {
  const token = newToken();
  q.insertAccount.run(token, Date.now());
  return q.accountByToken.get(token);
}

function authAccount(token) {
  if (!token) return null;
  return q.accountByToken.get(token) || null;
}

// ---- 路由處理 ----

const routes = {
  "POST /api/pair/create": (body) => {
    let account = authAccount(body.token);
    if (!account) account = createAccount();
    if (body.deviceId) q.upsertDevice.run(body.deviceId, account.id, Date.now());
    q.prunePairings.run(Date.now());
    const code = newCode();
    q.insertPairing.run(code, account.id, Date.now() + CODE_TTL_MS);
    return { token: account.token, code };
  },

  "POST /api/pair/claim": (body) => {
    if (!body.code || !body.deviceId) return { _status: 400, error: "code 與 deviceId 必填" };
    q.prunePairings.run(Date.now());
    const pairing = q.pairingByCode.get(String(body.code).trim());
    if (!pairing) return { _status: 404, error: "配對碼無效或已過期" };
    const account = db.prepare("SELECT * FROM accounts WHERE id = ?").get(pairing.account_id);
    if (!account) return { _status: 404, error: "帳號不存在" };
    q.upsertDevice.run(body.deviceId, account.id, Date.now());
    q.deletePairing.run(pairing.code); // 一次性
    return { token: account.token };
  },

  "POST /api/sync": (body) => {
    const account = authAccount(body.token);
    if (!account) return { _status: 401, error: "權杖無效" };
    if (!body.deviceId) return { _status: 400, error: "deviceId 必填" };
    q.upsertDevice.run(body.deviceId, account.id, Date.now());

    // 全量覆蓋本裝置貢獻
    const contrib = body.contrib || {};
    q.deleteDeviceContrib.run(body.deviceId);
    for (const date of Object.keys(contrib)) {
      const c = contrib[date] || {};
      q.insertContrib.run(body.deviceId, account.id, date, Math.max(0, c.ml | 0), Math.max(0, c.cups | 0));
    }
    q.pruneOldContrib.run(account.id, account.id, PRUNE_DAYS);

    // 設定 last-write-wins
    let settings = {};
    try { settings = JSON.parse(account.settings) || {}; } catch { settings = {}; }
    let settingsUpdatedAt = account.settings_updated_at;
    if (body.settings && (body.settingsUpdatedAt || 0) > settingsUpdatedAt) {
      settings = body.settings;
      settingsUpdatedAt = body.settingsUpdatedAt;
      q.updateSettings.run(JSON.stringify(settings), settingsUpdatedAt, account.id);
    }

    // 加總（重用共用邏輯）
    const rows = q.accountContrib.all(account.id);
    const aggregate = aggregateRows(rows);
    return { aggregate, settings, settingsUpdatedAt };
  },
};

function send(res, status, obj) {
  const data = JSON.stringify(obj);
  res.writeHead(status, { "content-type": "application/json", "content-length": Buffer.byteLength(data) });
  res.end(data);
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true });

  const key = `${req.method} ${req.url.split("?")[0]}`;
  const handler = routes[key];
  if (!handler) return send(res, 404, { error: "not found" });

  let raw = "";
  req.on("data", (c) => {
    raw += c;
    if (raw.length > 1_000_000) req.destroy(); // 1MB 上限
  });
  req.on("end", () => {
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { return send(res, 400, { error: "invalid json" }); }
    try {
      const out = handler(body);
      const status = out && out._status ? out._status : 200;
      if (out && out._status) delete out._status;
      send(res, status, out);
    } catch (e) {
      send(res, 500, { error: String((e && e.message) || e) });
    }
  });
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`喝水同步後端聽 :${PORT}（DB: ${DB_PATH}）`));
}

module.exports = { server, db };
