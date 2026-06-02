import { test } from "node:test";
import assert from "node:assert/strict";
import { LANGUAGES, t } from "../../i18n.ts";

test("i18n: 每種語言都涵蓋全部鍵且無遺漏", () => {
  const ref = t("zh-Hant");
  const refKeys = Object.keys(ref).sort();
  for (const { code } of LANGUAGES) {
    const keys = Object.keys(t(code)).sort();
    assert.deepEqual(keys, refKeys, `語言 ${code} 的鍵與繁中不一致`);
  }
});

test("i18n: scheduled 為函式、days 為 7 天、文字非空", () => {
  for (const { code } of LANGUAGES) {
    const s = t(code);
    assert.equal(typeof s.scheduled, "function");
    assert.match(s.scheduled(3), /3/);
    assert.equal(s.days.length, 7);
    assert.ok(s.notifyTitle.length > 0 && s.notifyBody.length > 0 && s.drankAction.length > 0);
  }
});

test("i18n: 未知語言回退繁中", () => {
  assert.equal(t("xx-YY").appTitle, t("zh-Hant").appTitle);
});
