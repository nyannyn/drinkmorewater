const $todayMl = document.getElementById("todayMl");
const $todayCups = document.getElementById("todayCups");
const $intervalMin = document.getElementById("intervalMin");
const $enabledToggle = document.getElementById("enabledToggle");
const $goalBar = document.getElementById("goalBar");
const $goalLabel = document.getElementById("goalLabel");
const $goalPct = document.getElementById("goalPct");
const $dailyGoal = document.getElementById("dailyGoal");
const $weeklyChart = document.getElementById("weeklyChart");
const $soundToggle = document.getElementById("soundToggle");
const $volumeSlider = document.getElementById("volumeSlider");
const $volumeLabel = document.getElementById("volumeLabel");
const $volumeRow = document.getElementById("volumeRow");

const DAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];

async function loadStatus() {
  const res = await window.api.getStatus();
  if (!res) return;
  $todayMl.textContent = res.todayMl;
  $todayCups.textContent = res.todayCups;
  $intervalMin.value = res.intervalMin;
  $enabledToggle.checked = res.enabled;
  $dailyGoal.value = res.dailyGoalMl;
  $soundToggle.checked = res.soundEnabled;
  $volumeSlider.value = res.soundVolume;
  $volumeLabel.textContent = res.soundVolume + "%";
  $volumeRow.style.display = res.soundEnabled ? "" : "none";

  const goal = res.dailyGoalMl || 2000;
  const pct = Math.min(Math.round((res.todayMl / goal) * 100), 100);
  $goalBar.style.width = pct + "%";
  $goalLabel.textContent = goal;
  $goalPct.textContent = pct;
}

async function loadWeeklyStats() {
  const res = await window.api.getWeeklyStats();
  if (!res) return;
  renderWeeklyChart(res.log, res.dailyGoalMl);
}

function renderWeeklyChart(log, goalMl) {
  $weeklyChart.innerHTML = "";
  if (!log || log.length === 0) {
    $weeklyChart.innerHTML =
      '<div style="font-size:11px;color:#999;text-align:center;width:100%">尚無歷史資料</div>';
    return;
  }

  const maxMl = Math.max(goalMl, ...log.map((d) => d.ml), 1);

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

function refresh() {
  loadStatus();
  loadWeeklyStats();
}

refresh();

// 水杯喝水後主行程會通知刷新
window.api.onStatusChanged(() => refresh());

$intervalMin.addEventListener("change", () => {
  window.api.setSettings({ intervalMin: parseFloat($intervalMin.value) });
});

$enabledToggle.addEventListener("change", () => {
  window.api.toggleEnabled();
});

$dailyGoal.addEventListener("change", () => {
  const val = parseInt($dailyGoal.value, 10);
  if (val >= 500 && val <= 5000) {
    window.api.setDailyGoal(val);
    loadStatus();
  }
});

$soundToggle.addEventListener("change", () => {
  const enabled = $soundToggle.checked;
  $volumeRow.style.display = enabled ? "" : "none";
  window.api.setSoundSettings(enabled, parseInt($volumeSlider.value, 10));
});

$volumeSlider.addEventListener("input", () => {
  $volumeLabel.textContent = $volumeSlider.value + "%";
});

$volumeSlider.addEventListener("change", () => {
  window.api.setSoundSettings($soundToggle.checked, parseInt($volumeSlider.value, 10));
});

document.getElementById("testBtn").addEventListener("click", () => {
  window.api.testReminder();
});

document.getElementById("exportBtn").addEventListener("click", async () => {
  await window.api.exportData();
});

document.getElementById("resetBtn").addEventListener("click", async () => {
  if (!confirm("確定要重置所有飲水紀錄嗎？此操作無法復原。")) return;
  await window.api.resetData();
  refresh();
});
