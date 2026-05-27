const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const filePath = path.join(app.getPath("userData"), "data.json");

let cache = null;

function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    cache = {};
  }
  return cache;
}

function persist() {
  fs.writeFileSync(filePath, JSON.stringify(cache, null, 2), "utf8");
}

// 取得指定 key（傳陣列回物件；傳 null 回全部副本）
function get(keys) {
  const data = load();
  if (keys == null) return { ...data };
  const out = {};
  for (const k of keys) out[k] = data[k];
  return out;
}

function set(obj) {
  const data = load();
  Object.assign(data, obj);
  persist();
}

module.exports = { get, set };
