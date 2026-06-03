// 煙霧測試：確認手機 core 能正確解析並使用跨平台共用的 ../../../shared/*。
// 同時驗證 types.ts 對 shared/schema 的 re-export 在 metro / node 測試下都解析得到。
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS, INTERVAL_OPTIONS, DRINK_ML } from "../types.ts";
import * as core from "../../../../shared/tracking.js";

test("shared 連結：types 由 shared/schema re-export 常數", () => {
  assert.equal(DRINK_ML, 300);
  assert.equal(DEFAULTS.dailyGoalMl, 2000);
  assert.deepEqual(INTERVAL_OPTIONS, [15, 30, 45, 60]);
});

test("shared 連結：tracking 純函式可用", () => {
  const out = core.applyDrink({ ...DEFAULTS, lastDate: "T", todayMl: 0, todayCups: 0, weeklyLog: [] }, 250, "T");
  assert.equal(out.todayMl, 250);
  assert.equal(out.todayCups, 1);
});
