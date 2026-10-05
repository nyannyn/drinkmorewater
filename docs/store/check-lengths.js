#!/usr/bin/env node
// 檢查 docs/store/ios-listing.md 各語言欄位是否齊全且不超過 App Store Connect 的字元上限。
// 用法：node docs/store/check-lengths.js   （任一欄位超限或缺漏 → exit 1）
const fs = require("fs");
const path = require("path");

const LIMITS = { name: 30, name_backup: 30, subtitle: 30, promo: 170, keywords: 100, description: 4000, whatsnew: 4000 };
const REQUIRED = Object.keys(LIMITS);

const md = fs.readFileSync(path.join(__dirname, "ios-listing.md"), "utf8").replace(/\r\n/g, "\n");
const sections = md.split(/^## /m).slice(1);
const locales = {};
for (const sec of sections) {
  const [header, ...rest] = sec.split("\n");
  const locale = header.trim();
  if (locale.startsWith("共通")) continue;
  const fields = {};
  let block = null;
  for (const line of rest) {
    const m = line.match(/^- (\w+): (.*)$/);
    if (m && block === null) { fields[m[1]] = m[2].trim(); continue; }
    const h = line.match(/^### (\w+)$/);
    if (h) { block = h[1]; fields[block] = ""; continue; }
    if (line.startsWith("---")) { block = null; continue; }
    if (block) fields[block] += (fields[block] ? "\n" : "") + line;
  }
  for (const k of Object.keys(fields)) fields[k] = fields[k].trim();
  locales[locale] = fields;
}

let bad = 0;
for (const [locale, fields] of Object.entries(locales)) {
  for (const key of REQUIRED) {
    const v = fields[key];
    const len = v == null ? -1 : [...v].length; // 以 code point 計，與 App Store Connect 一致
    let msg;
    if (v == null || v === "") msg = "缺欄位";
    else if (len > LIMITS[key]) msg = `超限 ${len} > ${LIMITS[key]}`;
    else if (key === "keywords" && /\s/.test(v)) msg = "關鍵字含空白";
    if (msg) { bad++; console.log(`✗ ${locale}.${key}: ${msg}`); }
    else console.log(`✓ ${locale}.${key}: ${len}/${LIMITS[key]}`);
  }
}
console.log(bad ? `\n${bad} 個問題` : "\n全部通過");
process.exit(bad ? 1 : 0);
