// 護眼提醒的判斷邏輯 —— 純函式，不碰 I/O / 計時器。目前只有桌面使用，放 shared 以便手機日後沿用。
// 依據：AAO 20-20-20 建議（每隔一段時間看遠方 20 秒）；研究顯示提醒停用後效果即消失，
// 因此設計重點是「少打擾」：已經離開過就不提醒、跟喝水提醒時間相近就合併成一則。

const DEFAULT_EYE_INTERVAL_MIN = 30;
const EYE_INTERVAL_MIN = 1;
const EYE_INTERVAL_MAX = 240;
const EYE_REST_IDLE_SEC = 20; // 閒置達此秒數視為已休息過（看過遠方）
const EYE_MERGE_WINDOW_MS = 3 * 60 * 1000; // 與喝水提醒相差在此之內就合併成一則
// 喝水 setTimeout 可能晚幾毫秒才觸發，輪詢剛好落在空檔時仍應交給喝水；超過寬限才視為計時器失效
const EYE_WATER_LATE_GRACE_MS = 10 * 1000;

/** 把使用者輸入的分鐘數取整並夾在範圍內；非數字回傳預設值。 */
function clampEyeInterval(v) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return DEFAULT_EYE_INTERVAL_MIN;
  return Math.min(EYE_INTERVAL_MAX, Math.max(EYE_INTERVAL_MIN, n));
}

/** 目前閒置秒數是否足以算作「休息過」。 */
function shouldCredit(idleSec) {
  return idleSec >= EYE_REST_IDLE_SEC;
}

/** 合併窗：預設 3 分鐘，但不超過間隔的一半（否則間隔很短時每次喝水都會被判成合併）。 */
function mergeWindowMs(intervalMs) {
  return Math.min(EYE_MERGE_WINDOW_MS, intervalMs / 2);
}

/**
 * 週期檢查時要做什麼。
 * - "credit"：使用者正離開／沒在操作 → 呼叫端把 lastRestAt 設為 now
 * - "none"：還沒到時間
 * - "defer"：到時間了，但喝水提醒馬上要響 → 這次不跳，交給喝水提醒合併
 * - "remind"：跳護眼提醒（呼叫端隨後把 lastRestAt 設為 now）
 * @param {{ now: number, lastRestAt: number, intervalMs: number, idleSec: number, nextWaterAt?: number|null }} p
 * @returns {"credit"|"none"|"defer"|"remind"}
 */
function eyeDecision({ now, lastRestAt, intervalMs, idleSec, nextWaterAt = null }) {
  if (shouldCredit(idleSec)) return "credit";
  if (now - lastRestAt < intervalMs) return "none";
  if (nextWaterAt != null && nextWaterAt >= now - EYE_WATER_LATE_GRACE_MS && nextWaterAt - now <= mergeWindowMs(intervalMs)) {
    return "defer";
  }
  return "remind";
}

/**
 * 喝水提醒觸發時：護眼是否已到期或即將到期（在合併窗內）→ 合併成一則。
 * @param {{ now: number, lastRestAt: number, intervalMs: number }} p
 */
function shouldMergeIntoWater({ now, lastRestAt, intervalMs }) {
  return lastRestAt + intervalMs - now <= mergeWindowMs(intervalMs);
}

module.exports = {
  DEFAULT_EYE_INTERVAL_MIN,
  EYE_INTERVAL_MIN,
  EYE_INTERVAL_MAX,
  EYE_REST_IDLE_SEC,
  EYE_MERGE_WINDOW_MS,
  EYE_WATER_LATE_GRACE_MS,
  clampEyeInterval,
  mergeWindowMs,
  shouldCredit,
  eyeDecision,
  shouldMergeIntoWater,
};
