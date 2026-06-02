// 提醒時間排程計算（純函式，平台無關、可單元測試）。
//
// 手機與桌面最大的差異：背景無法用 setTimeout 計時，必須「預先算出未來
// 一批提醒時間點」一次交給作業系統排程。iOS 同時最多只能有 64 則待發
// 通知，因此預設只排未來一段時間（horizon）並限制數量（maxCount），App
// 每次進前景時再重排補上。

export interface ScheduleParams {
  now: Date;
  intervalMin: number;
  activeStart: string; // "HH:MM"
  activeEnd: string; // "HH:MM"
  horizonHours?: number; // 預排多久（小時），預設 48
  maxCount?: number; // 上限（iOS 64，預留緩衝取 60）
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  return (h || 0) * 60 + (m || 0);
}

// 某個時間點的「當日分鐘」是否落在活躍時段內。
// 支援跨午夜的時段（例如 22:00–06:00）。
export function isWithinActiveWindow(date: Date, activeStart: string, activeEnd: string): boolean {
  const start = toMinutes(activeStart);
  const end = toMinutes(activeEnd);
  const m = date.getHours() * 60 + date.getMinutes();
  if (start === end) return true; // 全天
  return start < end ? m >= start && m < end : m >= start || m < end;
}

// 從 now 開始，每隔 intervalMin 取一個時間點；只保留落在活躍時段內者。
export function computeReminderTimes(params: ScheduleParams): Date[] {
  const {
    now,
    intervalMin,
    activeStart,
    activeEnd,
    horizonHours = 48,
    maxCount = 60,
  } = params;

  const interval = Math.max(1, intervalMin) * 60 * 1000;
  const horizonEnd = now.getTime() + horizonHours * 60 * 60 * 1000;
  const times: Date[] = [];

  // 第一則從「現在 + 一個間隔」開始，避免立刻就響。
  let t = now.getTime() + interval;
  while (t <= horizonEnd && times.length < maxCount) {
    const d = new Date(t);
    if (isWithinActiveWindow(d, activeStart, activeEnd)) {
      times.push(d);
    }
    t += interval;
  }
  return times;
}
