import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppData, DEFAULTS } from "./types";

// 原生 KV 持久化（取代桌面版的 userData/data.json）。
// 整包 AppData 以單一鍵存放，讀取時與預設值合併，避免新欄位缺漏。

const KEY = "drinkwater:data";

let cache: AppData | null = null;

export async function loadData(): Promise<AppData> {
  if (cache) return cache;
  let loaded: AppData;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    loaded = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    loaded = { ...DEFAULTS };
  }
  cache = loaded;
  return loaded;
}

// 讀任意 AsyncStorage 原始字串（CI 截圖模式用來讀取 screenshot-config）。
export async function getRawItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function saveData(patch: Partial<AppData>): Promise<AppData> {
  const current = await loadData();
  const next = { ...current, ...patch };
  cache = next;
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

// 測試用：清掉記憶體快取
export function _clearCache() {
  cache = null;
}
