// 端到端整合測試：起真伺服器，用真 SyncClient + 真 fetch 跑兩裝置連動全流程。
process.env.DB_PATH = ":memory:";

const { test, before, after } = require("node:test");
const assert = require("node:assert");
const { server } = require("../server");
const { SyncClient } = require("../../shared/sync-client");
const { DEFAULTS } = require("../../shared/schema");

let base;
before(async () => {
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

// 用記憶體當某裝置的 sync state 儲存層
function memClient() {
  let state = null;
  return new SyncClient({
    loadState: async () => state,
    saveState: async (s) => { state = { ...s }; },
    fetch,
  });
}

const TODAY = new Date().toDateString();
const appData = (todayMl, todayCups, extra = {}) => ({
  ...DEFAULTS, lastDate: TODAY, todayMl, todayCups, weeklyLog: [], ...extra,
});

test("health 檢查", async () => {
  const res = await fetch(`${base}/health`);
  assert.strictEqual((await res.json()).ok, true);
});

test("兩裝置配對 → 各自喝水 → 加總不重複、不掉資料", async () => {
  const A = memClient();
  const B = memClient();

  const { code } = await A.createPairingCode(base);
  assert.match(code, /^\d{6}$/);
  await B.claimPairingCode(base, code);
  assert.strictEqual(await A.isLinked(), true);
  assert.strictEqual(await B.isLinked(), true);

  // A 今天喝了 600
  let rA = await A.sync(appData(600, 2), TODAY);
  assert.strictEqual(rA.tracking.todayMl, 600); // 只有自己

  // B 今天喝了 300，同步後應看到加總 900
  let rB = await B.sync(appData(300, 1), TODAY);
  assert.strictEqual(rB.tracking.todayMl, 900);
  assert.strictEqual(rB.tracking.todayCups, 3);

  // A 再同步，也應看到 900（others=300）
  rA = await A.sync(appData(600, 2), TODAY);
  assert.strictEqual(rA.tracking.todayMl, 900);

  // 顯示疊加（不需再打伺服器）也應為 900
  const disp = await A.getDisplayTracking(appData(600, 2), TODAY);
  assert.strictEqual(disp.todayMl, 900);
});

test("冪等：同裝置重複同步同數值不會翻倍", async () => {
  const A = memClient();
  const B = memClient();
  const { code } = await A.createPairingCode(base);
  await B.claimPairingCode(base, code);

  await A.sync(appData(500, 2), TODAY);
  await A.sync(appData(500, 2), TODAY);
  const rB = await B.sync(appData(0, 0), TODAY);
  assert.strictEqual(rB.tracking.todayMl, 500); // 不是 1000
});

test("設定 last-write-wins：較新時間戳跨裝置傳播", async () => {
  const A = memClient();
  const B = memClient();
  const { code } = await A.createPairingCode(base);
  await B.claimPairingCode(base, code);

  // B 改目標為 3000，標記較新時間戳
  await B.markSettingsChanged(Date.now() + 1000);
  await B.sync(appData(0, 0, { dailyGoalMl: 3000 }), TODAY);

  // A 同步（本機還是 2000、時間戳較舊）→ 應收到 3000
  const rA = await A.sync(appData(0, 0, { dailyGoalMl: 2000 }), TODAY);
  assert.ok(rA.settingsToApply, "A 應收到要套用的設定");
  assert.strictEqual(rA.settingsToApply.dailyGoalMl, 3000);
});

test("無效配對碼被拒", async () => {
  const C = memClient();
  await assert.rejects(() => C.claimPairingCode(base, "000000"));
});

test("無效權杖的 sync 被拒", async () => {
  const res = await fetch(`${base}/api/sync`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: "bogus", deviceId: "x", contrib: {} }),
  });
  assert.strictEqual(res.status, 401);
});

test("跨日：昨日進 weeklyLog、今日獨立加總", async () => {
  const A = memClient();
  const B = memClient();
  const { code } = await A.createPairingCode(base);
  await B.claimPairingCode(base, code);

  const YESTERDAY = new Date(Date.now() - 86400000).toDateString();
  // A 有昨日 800 + 今日 200
  await A.sync(appData(200, 1, { weeklyLog: [{ date: YESTERDAY, ml: 800, cups: 3 }] }), TODAY);
  // B 今日 100
  const rB = await B.sync(appData(100, 1), TODAY);
  assert.strictEqual(rB.tracking.todayMl, 300); // 今日 200+100
  const y = rB.tracking.weeklyLog.find((d) => d.date === YESTERDAY);
  assert.strictEqual(y.ml, 800); // 昨日只有 A 的
});
