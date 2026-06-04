// 桌面同步層：包裝跨平台共用的 SyncClient，狀態存在既有 store（data.json）裡的 syncState 鍵。
// 與手機版相同的「疊加層」設計：store 的追蹤欄位仍只記本機自己的數字，
// 其他裝置貢獻另存於 syncState.others，顯示時相加。離線行為完全不變。
const store = require("./store");
const { SyncClient } = require("../shared/sync-client");

const SYNC_KEY = "syncState";

const client = new SyncClient({
  loadState: async () => store.get([SYNC_KEY])[SYNC_KEY] || null,
  saveState: async (s) => store.set({ [SYNC_KEY]: s }),
  // Electron 28+ 主行程有全域 fetch（undici）
  fetch: (...args) => fetch(...args),
});

const appData = () => store.get(null);
const today = () => new Date().toDateString();

module.exports = {
  isLinked: () => client.isLinked(),
  getServerUrl: () => client.getServerUrl(),
  createPairingCode: (url) => client.createPairingCode(url),
  claimPairingCode: (url, code) => client.claimPairingCode(url, code),
  unlink: () => client.unlink(),
  markSettingsChanged: () => client.markSettingsChanged(),

  // 顯示用追蹤資料（本機 + 其他裝置），未連動時等同本機。
  getDisplayTracking: () => client.getDisplayTracking(appData(), today()),

  // 執行一次同步；若遠端設定較新則寫回 store。回傳 sync 結果或 null（未連動）。
  sync: async () => {
    const res = await client.sync(appData(), today());
    if (res && res.settingsToApply) store.set(res.settingsToApply);
    return res;
  },
};
