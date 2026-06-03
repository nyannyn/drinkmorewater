const { test } = require("node:test");
const assert = require("node:assert");
const {
  contribFromAppData,
  addContribution,
  aggregateRows,
  computeOthers,
  sumContrib,
  contribToTracking,
  pickSettings,
  mergeSettings,
} = require("../merge");
const { DEFAULTS } = require("../schema");

test("contribFromAppData: weeklyLog + 今日 攤成貢獻表", () => {
  const data = {
    ...DEFAULTS,
    lastDate: "Tue Jun 02 2026",
    todayMl: 300,
    todayCups: 1,
    weeklyLog: [{ date: "Mon Jun 01 2026", ml: 900, cups: 3 }],
  };
  assert.deepStrictEqual(contribFromAppData(data), {
    "Mon Jun 01 2026": { ml: 900, cups: 3 },
    "Tue Jun 02 2026": { ml: 300, cups: 1 },
  });
});

test("addContribution: 累加到既有日期", () => {
  const out = addContribution({ d: { ml: 300, cups: 1 } }, "d", 250, 1);
  assert.deepStrictEqual(out.d, { ml: 550, cups: 2 });
});

test("aggregateRows: 多裝置同日加總", () => {
  const rows = [
    { date: "d1", ml: 300, cups: 1 },
    { date: "d1", ml: 600, cups: 2 },
    { date: "d2", ml: 500, cups: 2 },
  ];
  assert.deepStrictEqual(aggregateRows(rows), {
    d1: { ml: 900, cups: 3 },
    d2: { ml: 500, cups: 2 },
  });
});

test("computeOthers: 加總減本機 = 其他裝置，且不為負", () => {
  const agg = { d1: { ml: 900, cups: 3 }, d2: { ml: 500, cups: 2 } };
  const own = { d1: { ml: 300, cups: 1 }, d2: { ml: 800, cups: 9 } };
  assert.deepStrictEqual(computeOthers(agg, own), {
    d1: { ml: 600, cups: 2 },
    d2: { ml: 0, cups: 0 }, // 夾住不為負
  });
});

test("往返一致：own + others 還原回加總（不重複計數）", () => {
  // 兩裝置同一天各喝，sync 後雙方顯示都應是加總、且不重複。
  const ownA = { d: { ml: 600, cups: 2 } };
  const ownB = { d: { ml: 300, cups: 1 } };
  const aggregate = aggregateRows([
    { date: "d", ...ownA.d },
    { date: "d", ...ownB.d },
  ]);
  // A 的視角
  const othersForA = computeOthers(aggregate, ownA);
  assert.deepStrictEqual(sumContrib(ownA, othersForA), { d: { ml: 900, cups: 3 } });
  // B 的視角
  const othersForB = computeOthers(aggregate, ownB);
  assert.deepStrictEqual(sumContrib(ownB, othersForB), { d: { ml: 900, cups: 3 } });
});

test("contribToTracking: 今日進 today、其餘排序進 weeklyLog", () => {
  const contrib = {
    "Mon Jun 01 2026": { ml: 100, cups: 1 },
    "Wed Jun 03 2026": { ml: 300, cups: 1 }, // today
    "Tue Jun 02 2026": { ml: 200, cups: 1 },
  };
  const t = contribToTracking(contrib, "Wed Jun 03 2026");
  assert.strictEqual(t.todayMl, 300);
  assert.strictEqual(t.lastDate, "Wed Jun 03 2026");
  assert.deepStrictEqual(t.weeklyLog.map((d) => d.date), ["Mon Jun 01 2026", "Tue Jun 02 2026"]);
});

test("pickSettings: 只取設定欄位", () => {
  const s = pickSettings({ ...DEFAULTS, todayMl: 999, dailyGoalMl: 2500 });
  assert.strictEqual(s.todayMl, undefined);
  assert.strictEqual(s.dailyGoalMl, 2500);
  assert.strictEqual(s.intervalMin, DEFAULTS.intervalMin);
});

test("mergeSettings: 較新時間戳勝", () => {
  const local = { dailyGoalMl: 2000 };
  const remote = { dailyGoalMl: 3000 };
  const a = mergeSettings(local, 100, remote, 200);
  assert.strictEqual(a.changed, true);
  assert.strictEqual(a.settings.dailyGoalMl, 3000);
  const b = mergeSettings(local, 300, remote, 200);
  assert.strictEqual(b.changed, false);
  assert.strictEqual(b.settings.dailyGoalMl, 2000);
});
