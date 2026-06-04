const { test } = require("node:test");
const assert = require("node:assert");
const { SyncClient } = require("../sync-client");
const { DEFAULTS } = require("../schema");

function memClient(fetchImpl) {
  let state = null;
  return new SyncClient({
    loadState: async () => state,
    saveState: async (s) => { state = { ...s }; },
    fetch: fetchImpl,
  });
}

const TODAY = "Wed Jun 03 2026";
const appData = (todayMl, todayCups, weeklyLog = []) => ({
  ...DEFAULTS, lastDate: TODAY, todayMl, todayCups, weeklyLog,
});

test("未連動：isLinked 為 false、sync 回 null", async () => {
  const c = memClient();
  assert.strictEqual(await c.isLinked(), false);
  assert.strictEqual(await c.sync(appData(300, 1), TODAY), null);
});

test("未連動：顯示追蹤等同本機資料（離線行為不變）", async () => {
  const c = memClient();
  const disp = await c.getDisplayTracking(appData(600, 2, [{ date: "Tue Jun 02 2026", ml: 900, cups: 3 }]), TODAY);
  assert.strictEqual(disp.todayMl, 600);
  assert.strictEqual(disp.todayCups, 2);
  assert.strictEqual(disp.weeklyLog.length, 1);
  assert.strictEqual(disp.weeklyLog[0].ml, 900);
});

test("deviceId 會自動產生並持久化", async () => {
  let state = null;
  const c = new SyncClient({
    loadState: async () => state,
    saveState: async (s) => { state = { ...s }; },
  });
  await c.isLinked();
  assert.match(state.deviceId, /^dev_/);
});

test("配對：createPairingCode 會存下 token 與 serverUrl", async () => {
  const calls = [];
  const fakeFetch = async (url, opts) => {
    calls.push({ url, body: JSON.parse(opts.body) });
    return { ok: true, json: async () => ({ token: "tok123", code: "424242" }) };
  };
  const c = memClient(fakeFetch);
  const { code } = await c.createPairingCode("https://srv");
  assert.strictEqual(code, "424242");
  assert.strictEqual(await c.isLinked(), true);
  assert.strictEqual(await c.getServerUrl(), "https://srv");
  assert.match(calls[0].url, /\/api\/pair\/create$/);
});

test("sync 失敗時不吞掉錯誤（由上層 catch）", async () => {
  const fakeFetch = async () => ({ ok: false, status: 500, text: async () => "boom" });
  const c = memClient(fakeFetch);
  // 先用 stub 完成連動
  c._state = { serverUrl: "https://srv", deviceId: "d", token: "t", others: {}, settingsUpdatedAt: 0 };
  await assert.rejects(() => c.sync(appData(0, 0), TODAY));
});
