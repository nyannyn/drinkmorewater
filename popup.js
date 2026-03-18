const $todayMl = document.getElementById("todayMl");
const $dailyGoal = document.getElementById("dailyGoal");
const $todayCups = document.getElementById("todayCups");
const $cupWater = document.getElementById("cupWater");
const $drinkBtn = document.getElementById("drinkBtn");
const $intervalMin = document.getElementById("intervalMin");
const $cupMl = document.getElementById("cupMl");
const $goalMl = document.getElementById("goalMl");
const $enabledToggle = document.getElementById("enabledToggle");

// 載入狀態
function loadStatus() {
  chrome.runtime.sendMessage({ type: "GET_STATUS" }, (res) => {
    if (!res) return;
    $todayMl.textContent = res.todayMl;
    $dailyGoal.textContent = res.dailyGoal;
    $todayCups.textContent = res.todayCups;
    const pct = Math.min((res.todayMl / res.dailyGoal) * 100, 100);
    $cupWater.style.height = pct + "%";
    $intervalMin.value = res.intervalMin;
    $cupMl.value = res.cupMl;
    $goalMl.value = res.dailyGoal;
    $enabledToggle.checked = res.enabled;
  });
}

loadStatus();

// 喝水
$drinkBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "DRINK" }, () => {
    loadStatus();
  });
});

// 設定變更
function saveSettings() {
  chrome.runtime.sendMessage({
    type: "SET_SETTINGS",
    settings: {
      intervalMin: parseInt($intervalMin.value),
      cupMl: parseInt($cupMl.value),
      dailyGoal: parseInt($goalMl.value),
    },
  });
}

$intervalMin.addEventListener("change", saveSettings);
$cupMl.addEventListener("change", saveSettings);
$goalMl.addEventListener("change", saveSettings);

// 啟用/停用
$enabledToggle.addEventListener("change", () => {
  chrome.runtime.sendMessage({ type: "TOGGLE_ENABLED" });
});
