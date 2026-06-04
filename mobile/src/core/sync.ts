// 手機同步層：包裝跨平台共用的 SyncClient，狀態存在 AsyncStorage（獨立於飲水資料）。
// 採「疊加層」設計：本機 AppData 仍只記自己的數字，其他裝置貢獻另存，顯示時相加。
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SyncClient } from "../../../shared/sync-client.js";
import { AppData, DayLog } from "./types";

const STATE_KEY = "drinkwater:sync";

export const syncClient = new SyncClient({
  loadState: async () => {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  saveState: async (s: unknown) => {
    await AsyncStorage.setItem(STATE_KEY, JSON.stringify(s));
  },
  // RN 全域有 fetch
  fetch: fetch as typeof fetch,
});

const today = () => new Date().toDateString();

export type DisplayTracking = {
  todayMl: number;
  todayCups: number;
  weeklyLog: DayLog[];
  lastDate: string;
};

export async function isLinked(): Promise<boolean> {
  return syncClient.isLinked();
}

export async function getServerUrl(): Promise<string> {
  return syncClient.getServerUrl();
}

export async function createPairingCode(serverUrl: string): Promise<string> {
  const { code } = await syncClient.createPairingCode(serverUrl);
  return code;
}

export async function claimPairingCode(serverUrl: string, code: string): Promise<boolean> {
  return syncClient.claimPairingCode(serverUrl, code);
}

export async function unlink(): Promise<void> {
  return syncClient.unlink();
}

export async function markSettingsChanged(): Promise<void> {
  return syncClient.markSettingsChanged();
}

// 顯示用追蹤資料（本機 + 其他裝置），不需打伺服器。
export async function getDisplayTracking(data: AppData): Promise<DisplayTracking> {
  return syncClient.getDisplayTracking(data, today());
}

// 執行一次同步；回傳要套用到本機的設定（若對方較新）或 null。
export async function runSync(
  data: AppData
): Promise<{ tracking: DisplayTracking; settingsToApply: Partial<AppData> | null } | null> {
  try {
    const res = await syncClient.sync(data, today());
    if (!res) return null;
    return { tracking: res.tracking, settingsToApply: res.settingsToApply as Partial<AppData> | null };
  } catch (e) {
    // 同步失敗不影響離線使用
    console.warn("sync failed", e);
    return null;
  }
}
