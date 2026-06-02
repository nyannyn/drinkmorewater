import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppData, DEFAULTS } from "./types";

// 原生 KV 持久化（取代桌面版的 userData/data.json）。
// 整包 AppData 以單一鍵存放，讀取時與預設值合併，避免新欄位缺漏。

const KEY = "drinkwater:data";

let cache: AppData | null = null;

export async function loadData(): Promise<AppData> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    cache = { ...DEFAULTS };
  }
  return cache;
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
