const { test } = require("node:test");
const assert = require("node:assert");
const {
  clampEyeInterval,
  shouldCredit,
  eyeDecision,
  shouldMergeIntoWater,
} = require("../eye");

const MIN = 60 * 1000;
const T0 = 1_000_000_000;
const WINDOW = 3 * MIN; // 規格值寫死，不引用實作常數，否則改常數測試仍綠
const p = (o) => ({ now: T0 + 30 * MIN, lastRestAt: T0, intervalMs: 30 * MIN, idleSec: 0, nextWaterAt: null, ...o });

test("clampEyeInterval: 取整、夾範圍、非數字回預設", () => {
  assert.strictEqual(clampEyeInterval(30), 30);
  assert.strictEqual(clampEyeInterval("17.6"), 18);
  assert.strictEqual(clampEyeInterval(0), 1);
  assert.strictEqual(clampEyeInterval(999), 240);
  assert.strictEqual(clampEyeInterval("abc"), 30);
});

test("shouldCredit: 19 秒不算、20 秒算休息過", () => {
  assert.strictEqual(shouldCredit(19), false);
  assert.strictEqual(shouldCredit(20), true);
});

test("eyeDecision: 閒置中一律 credit（即使已到期）", () => {
  assert.strictEqual(eyeDecision(p({ idleSec: 20 })), "credit");
});

test("eyeDecision: 未滿間隔 none、剛好滿間隔 remind", () => {
  assert.strictEqual(eyeDecision(p({ now: T0 + 30 * MIN - 1 })), "none");
  assert.strictEqual(eyeDecision(p()), "remind");
});

test("eyeDecision: 喝水在合併窗內 defer，窗外照常 remind", () => {
  const now = T0 + 30 * MIN;
  assert.strictEqual(eyeDecision(p({ nextWaterAt: now + WINDOW })), "defer");
  assert.strictEqual(eyeDecision(p({ nextWaterAt: now + WINDOW + 1 })), "remind");
});

test("eyeDecision: 喝水剛過預定時間（setTimeout 晚觸發）10 秒內仍 defer", () => {
  const now = T0 + 30 * MIN;
  assert.strictEqual(eyeDecision(p({ nextWaterAt: now - 5 })), "defer");
  assert.strictEqual(eyeDecision(p({ nextWaterAt: now - 10 * 1000 })), "defer");
});

test("eyeDecision: 喝水時間已過超過 10 秒（計時器失效）不 defer", () => {
  assert.strictEqual(eyeDecision(p({ nextWaterAt: T0 + 30 * MIN - 10 * 1000 - 1 })), "remind");
});

test("合併窗不超過間隔一半：間隔 2 分時剛提醒完不會被判合併", () => {
  const base = { lastRestAt: T0, intervalMs: 2 * MIN };
  assert.strictEqual(shouldMergeIntoWater({ ...base, now: T0 + 10 * 1000 }), false);
  assert.strictEqual(shouldMergeIntoWater({ ...base, now: T0 + 1 * MIN }), true);
  assert.strictEqual(eyeDecision({ now: T0 + 2 * MIN, lastRestAt: T0, intervalMs: 2 * MIN, idleSec: 0, nextWaterAt: T0 + 2 * MIN + 61 * 1000 }), "remind");
});

test("shouldMergeIntoWater: 已到期或合併窗內合併，窗外不合併", () => {
  const base = { lastRestAt: T0, intervalMs: 30 * MIN };
  assert.strictEqual(shouldMergeIntoWater({ ...base, now: T0 + 40 * MIN }), true);
  assert.strictEqual(shouldMergeIntoWater({ ...base, now: T0 + 30 * MIN - WINDOW }), true);
  assert.strictEqual(shouldMergeIntoWater({ ...base, now: T0 + 30 * MIN - WINDOW - 1 }), false);
});
