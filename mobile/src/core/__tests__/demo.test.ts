import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDemoData } from "../demo.ts";

test("buildDemoData: 今日 1500/2000、過去 6 天連續日期、三天達標", () => {
  const d = buildDemoData("Mon Jun 01 2026");
  assert.equal(d.lastDate, "Mon Jun 01 2026");
  assert.equal(d.todayMl, 1500);
  assert.equal(d.dailyGoalMl, 2000);
  assert.deepEqual(
    d.weeklyLog.map((x) => x.date),
    ["Tue May 26 2026", "Wed May 27 2026", "Thu May 28 2026", "Fri May 29 2026", "Sat May 30 2026", "Sun May 31 2026"]
  );
  assert.equal(d.weeklyLog.filter((x) => x.ml >= d.dailyGoalMl).length, 3);
});
