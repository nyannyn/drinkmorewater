const $todayMl = document.getElementById("todayMl");
const $todayCups = document.getElementById("todayCups");
const $intervalMin = document.getElementById("intervalMin");
const $enabledToggle = document.getElementById("enabledToggle");
const $goalBar = document.getElementById("goalBar");
const $goalLabel = document.getElementById("goalLabel");
const $goalPct = document.getElementById("goalPct");
const $dailyGoal = document.getElementById("dailyGoal");
const $weeklyChart = document.getElementById("weeklyChart");

const DAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];

function loadStatus() {
  chrome.runtime.sendMessage({ type: "GET_STATUS" }, (res) => {
    if (!res) return;
    $todayMl.textContent = res.todayMl;
    $todayCups.textContent = res.todayCups;
    $intervalMin.value = res.intervalMin;
    $enabledToggle.checked = res.enabled;
    $dailyGoal.value = res.dailyGoalMl;

    // 更新目標進度
    const goal = res.dailyGoalMl || 2000;
    const pct = Math.min(Math.round((res.todayMl / goal) * 100), 100);
    $goalBar.style.width = pct + "%";
    $goalLabel.textContent = goal;
    $goalPct.textContent = pct;
  });
}

function loadWeeklyStats() {
  chrome.runtime.sendMessage({ type: "GET_WEEKLY_STATS" }, (res) => {
    if (!res) return;
    renderWeeklyChart(res.log, res.dailyGoalMl);
  });
}

function renderWeeklyChart(log, goalMl) {
  $weeklyChart.innerHTML = "";
  if (!log || log.length === 0) {
    $weeklyChart.innerHTML = '<div style="font-size:11px;color:#999;text-align:center;width:100%">尚無歷史資料</div>';
    return;
  }

  const maxMl = Math.max(goalMl, ...log.map(d => d.ml), 1);

  log.forEach((entry) => {
    const d = new Date(entry.date);
    const dayName = DAY_NAMES[d.getDay()];
    const barH = Math.max((entry.ml / maxMl) * 55, 2);
    const reached = entry.ml >= goalMl;

    const col = document.createElement("div");
    col.className = "chart-col";

    const mlLabel = document.createElement("div");
    mlLabel.className = "chart-ml";
    mlLabel.textContent = entry.ml > 0 ? entry.ml : "";

    const barWrap = document.createElement("div");
    barWrap.className = "chart-bar-wrap";

    const bar = document.createElement("div");
    bar.className = "chart-bar " + (reached ? "reached" : "missed");
    bar.style.height = barH + "px";

    barWrap.appendChild(bar);

    const dayLabel = document.createElement("div");
    dayLabel.className = "chart-day";
    dayLabel.textContent = dayName;

    col.appendChild(mlLabel);
    col.appendChild(barWrap);
    col.appendChild(dayLabel);

    $weeklyChart.appendChild(col);
  });
}

loadStatus();
loadWeeklyStats();

$intervalMin.addEventListener("change", () => {
  chrome.runtime.sendMessage({
    type: "SET_SETTINGS",
    settings: { intervalMin: parseFloat($intervalMin.value) },
  });
});

$enabledToggle.addEventListener("change", () => {
  chrome.runtime.sendMessage({ type: "TOGGLE_ENABLED" });
});

// 每日目標設定
$dailyGoal.addEventListener("change", () => {
  const val = parseInt($dailyGoal.value, 10);
  if (val >= 500 && val <= 5000) {
    chrome.runtime.sendMessage({ type: "SET_DAILY_GOAL", dailyGoalMl: val });
    loadStatus();
  }
});

// 立即測試
document.getElementById("testBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "TEST_REMINDER" });
  window.close();
});

// 匯出資料
document.getElementById("exportBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "EXPORT_DATA" }, (data) => {
    if (!data) return;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "drink-water-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
  });
});

// 重置紀錄
document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("確定要重置所有飲水紀錄嗎？此操作無法復原。")) return;
  chrome.runtime.sendMessage({ type: "RESET_DATA" }, () => {
    loadStatus();
    loadWeeklyStats();
  });
});
