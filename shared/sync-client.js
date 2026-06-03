// 共用同步客戶端 —— 平台無關。用全域 fetch 當傳輸，儲存層以 callback 注入。
// 設計為「疊加層」：本機 AppData 的追蹤欄位永遠只記「本機自己」的數字，
// 離線記錄 / 跨日重設邏輯完全不動；其他裝置的貢獻存在獨立的 sync state，
// 顯示時才疊加（own + others），因此既不破壞單機行為，也能正確多裝置連動。

const { contribFromAppData, aggregateRows, computeOthers, sumContrib, contribToTracking, pickSettings, mergeSettings } = require("./merge");

/**
 * @typedef {Object} SyncState
 * @property {string} serverUrl
 * @property {string} deviceId
 * @property {string|null} token              帳號權杖（配對後取得）
 * @property {Record<string,{ml:number,cups:number}>} others  其他裝置貢獻（上次同步快取）
 * @property {number} settingsUpdatedAt        本機設定最後變更時間戳
 * @property {number} lastSyncedAt
 */

/** @type {SyncState} */
const EMPTY_STATE = { serverUrl: "", deviceId: "", token: null, others: {}, settingsUpdatedAt: 0, lastSyncedAt: 0 };

function randomId() {
  // 簡單夠用的隨機 id（不需密碼學等級）。
  return "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

class SyncClient {
  /**
   * @param {Object} opts
   * @param {() => Promise<Partial<SyncState>|null>} opts.loadState
   * @param {(s: SyncState) => Promise<void>} opts.saveState
   * @param {typeof fetch} [opts.fetch]
   */
  constructor({ loadState, saveState, fetch: f }) {
    this._load = loadState;
    this._save = saveState;
    this._fetch = f || (typeof fetch !== "undefined" ? fetch : null);
    /** @type {SyncState|null} */
    this._state = null;
  }

  async _state_() {
    if (this._state) return this._state;
    const raw = (await this._load()) || {};
    this._state = { ...EMPTY_STATE, ...raw };
    if (!this._state.deviceId) {
      this._state.deviceId = randomId();
      await this._save(this._state);
    }
    return this._state;
  }

  async _commit() {
    await this._save(this._state);
  }

  async isLinked() {
    const s = await this._state_();
    return Boolean(s.token && s.serverUrl);
  }

  async getServerUrl() {
    return (await this._state_()).serverUrl;
  }

  async _api(serverUrl, path, body) {
    if (!this._fetch) throw new Error("no fetch available");
    const res = await this._fetch(serverUrl.replace(/\/$/, "") + path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`sync ${path} failed: ${res.status} ${text}`);
    }
    return res.json();
  }

  /** 裝置 A：產生配對碼（順帶建立帳號）。回傳 {code}。 */
  async createPairingCode(serverUrl) {
    const s = await this._state_();
    const out = await this._api(serverUrl, "/api/pair/create", { deviceId: s.deviceId, token: s.token });
    s.serverUrl = serverUrl;
    s.token = out.token;
    await this._commit();
    return { code: out.code };
  }

  /** 裝置 B：用配對碼加入帳號。 */
  async claimPairingCode(serverUrl, code) {
    const s = await this._state_();
    const out = await this._api(serverUrl, "/api/pair/claim", { deviceId: s.deviceId, code: String(code).trim() });
    s.serverUrl = serverUrl;
    s.token = out.token;
    await this._commit();
    return true;
  }

  /** 解除連動（保留本機資料，只切斷帳號）。 */
  async unlink() {
    const s = await this._state_();
    s.token = null;
    s.serverUrl = "";
    s.others = {};
    await this._commit();
  }

  /** 標記本機設定剛變更（讓下次同步以較新時間戳覆蓋對方）。 */
  async markSettingsChanged(now = Date.now()) {
    const s = await this._state_();
    s.settingsUpdatedAt = now;
    await this._commit();
  }

  /**
   * 顯示用追蹤資料 = 本機 own + 其他裝置 others（讀取時疊加，不改 AppData）。
   * @param {import('./schema').AppData} appData
   * @param {string} today
   */
  async getDisplayTracking(appData, today) {
    const s = await this._state_();
    const own = contribFromAppData(appData);
    const combined = sumContrib(own, s.others || {});
    return contribToTracking(combined, today);
  }

  /**
   * 執行一次同步：推本機貢獻 + 設定，拉回加總，更新 others 與設定。
   * 回傳 { tracking, settingsToApply, settingsUpdatedAt } 或 null（未連動）。
   * @param {import('./schema').AppData} appData
   * @param {string} today
   */
  async sync(appData, today) {
    const s = await this._state_();
    if (!s.token || !s.serverUrl) return null;
    const own = contribFromAppData(appData);
    const localSettings = pickSettings(appData);
    const out = await this._api(s.serverUrl, "/api/sync", {
      deviceId: s.deviceId,
      token: s.token,
      contrib: own,
      settings: localSettings,
      settingsUpdatedAt: s.settingsUpdatedAt,
    });
    // out: { aggregate: ContribMap, settings, settingsUpdatedAt }
    s.others = computeOthers(out.aggregate || {}, own);
    const merged = mergeSettings(localSettings, s.settingsUpdatedAt, out.settings, out.settingsUpdatedAt);
    s.settingsUpdatedAt = merged.updatedAt;
    s.lastSyncedAt = Date.now();
    await this._commit();
    const tracking = contribToTracking(sumContrib(own, s.others), today);
    return {
      tracking,
      settingsToApply: merged.changed ? merged.settings : null,
      settingsUpdatedAt: merged.updatedAt,
    };
  }
}

module.exports = { SyncClient, randomId, EMPTY_STATE };
// 伺服器也會 require 部分純函式，故一併由 merge.js 匯出；此檔聚焦客戶端。
