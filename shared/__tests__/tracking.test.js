const { test } = require("node:test");
const assert = require("node:assert");
const { resetDailyIfNeeded, applyDrink, padToWeek, getWeeklyStats, resetTracking } = require("../tracking");
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

test("padToWeek: 空 log 補成連續 7 天全 0、末筆今日", () => {
  const log = padToWeek([], "Mon Jun 01 2026");
  assert.strictEqual(log.length, 7);
  assert.deepStrictEqual(
    log.map((d) => d.date),
    ["Tue May 26 2026", "Wed May 27 2026", "Thu May 28 2026", "Fri May 29 2026", "Sat May 30 2026", "Sun May 31 2026", "Mon Jun 01 2026"]
  );
  assert.ok(log.every((d) => d.ml === 0 && d.cups === 0));
});

test("padToWeek: 缺中間日期補 0，已有的保留值與順序", () => {
  const log = padToWeek(
    [
      { date: "Sat May 30 2026", ml: 1800, cups: 6 },
      { date: "Wed May 27 2026", ml: 900, cups: 3 },
      { date: "Mon Jun 01 2026", ml: 600, cups: 2 },
    ],
    "Mon Jun 01 2026"
  );
  assert.deepStrictEqual(
    log.map((d) => [d.date.slice(0, 3), d.ml]),
    [["Tue", 0], ["Wed", 900], ["Thu", 0], ["Fri", 0], ["Sat", 1800], ["Sun", 0], ["Mon", 600]]
  );
});

test("padToWeek: 超過 7 天只留最近 7 天", () => {
  const old = { date: "Mon May 18 2026", ml: 5000, cups: 20 };
  const log = padToWeek([old, { date: "Mon Jun 01 2026", ml: 1, cups: 1 }], "Mon Jun 01 2026");
  assert.strictEqual(log.length, 7);
  assert.ok(!log.some((d) => d.ml === 5000));
  assert.strictEqual(log[0].date, "Tue May 26 2026");
});

test("getWeeklyStats: 恆 7 筆，儲存層 weeklyLog 不被補零", () => {
  const data = base();
  const { log } = getWeeklyStats(data, "Mon Jun 01 2026");
  assert.strictEqual(log.length, 7);
  assert.strictEqual(data.weeklyLog.length, 0);
});

test("resetTracking: 清空追蹤保留設定", () => {
  const out = resetTracking({ ...base(), dailyGoalMl: 3000 }, "Wed Jun 03 2026");
  assert.strictEqual(out.todayMl, 0);
  assert.deepStrictEqual(out.weeklyLog, []);
  assert.strictEqual(out.dailyGoalMl, 3000);
});
