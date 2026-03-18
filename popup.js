const $todayMl = document.getElementById("todayMl");
const $todayCups = document.getElementById("todayCups");
const $intervalMin = document.getElementById("intervalMin");
const $enabledToggle = document.getElementById("enabledToggle");

function loadStatus() {
  chrome.runtime.sendMessage({ type: "GET_STATUS" }, (res) => {
    if (!res) return;
    $todayMl.textContent = res.todayMl;
    $todayCups.textContent = res.todayCups;
    $intervalMin.value = res.intervalMin;
    $enabledToggle.checked = res.enabled;
  });
}

loadStatus();

$intervalMin.addEventListener("change", () => {
  chrome.runtime.sendMessage({
    type: "SET_SETTINGS",
    settings: { intervalMin: parseFloat($intervalMin.value) },
  });
});

$enabledToggle.addEventListener("change", () => {
  chrome.runtime.sendMessage({ type: "TOGGLE_ENABLED" });
});

// 立即測試
document.getElementById("testBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "TEST_REMINDER" });
  window.close();
});
