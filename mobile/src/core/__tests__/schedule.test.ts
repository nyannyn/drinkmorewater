import { test } from "node:test";
import assert from "node:assert/strict";
import { computeReminderTimes, isWithinActiveWindow } from "../schedule.ts";

test("isWithinActiveWindow: 一般同日時段", () => {
  const inDay = new Date("2026-06-02T10:00:00");
  const beforeDay = new Date("2026-06-02T07:00:00");
  const afterDay = new Date("2026-06-02T23:00:00");
  assert.equal(isWithinActiveWindow(inDay, "08:00", "22:00"), true);
  assert.equal(isWithinActiveWindow(beforeDay, "08:00", "22:00"), false);
  assert.equal(isWithinActiveWindow(afterDay, "08:00", "22:00"), false);
});

test("isWithinActiveWindow: 跨午夜時段 22:00-06:00", () => {
  assert.equal(isWithinActiveWindow(new Date("2026-06-02T23:30:00"), "22:00", "06:00"), true);
  assert.equal(isWithinActiveWindow(new Date("2026-06-02T03:00:00"), "22:00", "06:00"), true);
  assert.equal(isWithinActiveWindow(new Date("2026-06-02T12:00:00"), "22:00", "06:00"), false);
});

test("computeReminderTimes: 第一則不立即、間隔正確", () => {
  const now = new Date("2026-06-02T10:00:00");
  const times = computeReminderTimes({ now, intervalMin: 30, activeStart: "08:00", activeEnd: "22:00", horizonHours: 2 });
  assert.ok(times.length > 0);
  assert.equal(times[0].getTime(), now.getTime() + 30 * 60 * 1000);
  // 相鄰間隔皆為 30 分
  for (let i = 1; i < times.length; i++) {
    assert.equal(times[i].getTime() - times[i - 1].getTime(), 30 * 60 * 1000);
  }
});

test("computeReminderTimes: 活躍時段外被略過", () => {
  const now = new Date("2026-06-02T21:00:00");
  const times = computeReminderTimes({ now, intervalMin: 30, activeStart: "08:00", activeEnd: "22:00", horizonHours: 4 });
  // 21:30 在內、22:00 起到隔日 08:00 前皆應被略過
  for (const tm of times) {
    assert.equal(isWithinActiveWindow(tm, "08:00", "22:00"), true);
  }
});

test("computeReminderTimes: 遵守 maxCount 上限（iOS 64 則限制）", () => {
  const now = new Date("2026-06-02T08:00:00");
  const times = computeReminderTimes({ now, intervalMin: 15, activeStart: "00:00", activeEnd: "00:00", horizonHours: 240, maxCount: 60 });
  assert.equal(times.length, 60);
});
