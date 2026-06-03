const { test } = require("node:test");
const assert = require("node:assert");
const { resetDailyIfNeeded, applyDrink, getWeeklyStats, resetTracking } = require("../tracking");
const { DEFAULTS } = require("../schema");

const base = () => ({ ...DEFAULTS, lastDate: "Mon Jun 01 2026", todayMl: 600, todayCups: 2, weeklyLog: [] });

test("resetDailyIfNeeded: 同日不變", () => {
  const d = base();
  assert.strictEqual(resetDailyIfNeeded(d, "Mon Jun 01 2026"), d);
});

test("resetDailyIfNeeded: 跨日把昨日收進 weeklyLog 並歸零", () => {
  const out = resetDailyIfNeeded(base(), "Tue Jun 02 2026");
  assert.strictEqual(out.todayMl, 0);
  assert.strictEqual(out.todayCups, 0);
  assert.strictEqual(out.lastDate, "Tue Jun 02 2026");
  assert.deepStrictEqual(out.weeklyLog, [{ date: "Mon Jun 01 2026", ml: 600, cups: 2 }]);
});

test("resetDailyIfNeeded: weeklyLog 上限 7 筆", () => {
  const log = Array.from({ length: 7 }, (_, i) => ({ date: "d" + i, ml: i, cups: i }));
  const out = resetDailyIfNeeded({ ...base(), weeklyLog: log }, "Tue Jun 02 2026");
  assert.strictEqual(out.weeklyLog.length, 7);
  assert.strictEqual(out.weeklyLog[0].date, "d1"); // d0 被擠出
});

test("applyDrink: 同日累加，預設用 drinkMl", () => {
  const out = applyDrink(base(), undefined, "Mon Jun 01 2026");
  assert.strictEqual(out.todayMl, 600 + DEFAULTS.drinkMl);
  assert.strictEqual(out.todayCups, 3);
});

test("applyDrink: 跨日先重設再加", () => {
  const out = applyDrink(base(), 250, "Tue Jun 02 2026");
  assert.strictEqual(out.todayMl, 250);
  assert.strictEqual(out.todayCups, 1);
});

test("getWeeklyStats: 回傳含今日的序列", () => {
  const { log, dailyGoalMl } = getWeeklyStats(base(), "Mon Jun 01 2026");
  assert.strictEqual(log.at(-1).ml, 600);
  assert.strictEqual(dailyGoalMl, DEFAULTS.dailyGoalMl);
});

test("resetTracking: 清空追蹤保留設定", () => {
  const out = resetTracking({ ...base(), dailyGoalMl: 3000 }, "Wed Jun 03 2026");
  assert.strictEqual(out.todayMl, 0);
  assert.deepStrictEqual(out.weeklyLog, []);
  assert.strictEqual(out.dailyGoalMl, 3000);
});
