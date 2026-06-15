// ===== i18n =====
const WELCOME_I18N = {
  "zh-Hant": {
    title: "歡迎使用喝水提醒！",
    subtitle: "幾個小提示，幫助你快速上手：",
    step1Title: "記錄喝水",
    step1Desc: "水杯彈出時，長按杯子或按 Space 即可記錄一次飲水。",
    step2Title: "背景常駐",
    step2Desc: "你可以隨時關閉這個視窗，提醒會在背景持續運作。",
    step3TitleWin: "重新開啟",
    step3DescWin: "點擊右下角工具列的水滴圖示，即可隨時開啟統計與設定。",
    step3TitleMac: "重新開啟",
    step3DescMac: "點擊右上角選單列的水滴圖示，即可隨時開啟統計與設定。",
    btn: "開始使用",
  },
  "zh-Hans": {
    title: "欢迎使用喝水提醒！",
    subtitle: "几个小提示，帮助你快速上手：",
    step1Title: "记录喝水",
    step1Desc: "水杯弹出时，长按杯子或按 Space 即可记录一次饮水。",
    step2Title: "后台常驻",
    step2Desc: "你可以随时关闭这个窗口，提醒会在后台持续运行。",
    step3TitleWin: "重新打开",
    step3DescWin: "点击右下角任务栏的水滴图标，即可随时打开统计与设置。",
    step3TitleMac: "重新打开",
    step3DescMac: "点击右上角菜单栏的水滴图标，即可随时打开统计与设置。",
    btn: "开始使用",
  },
  en: {
    title: "Welcome to Drink Water Reminder!",
    subtitle: "A few tips to get you started:",
    step1Title: "Record a drink",
    step1Desc: "When the cup appears, hold it down or press Space to log a drink.",
    step2Title: "Runs in background",
    step2Desc: "You can close this window anytime — reminders keep running in the background.",
    step3TitleWin: "Reopen anytime",
    step3DescWin: "Click the droplet icon in the bottom-right system tray to open stats & settings.",
    step3TitleMac: "Reopen anytime",
    step3DescMac: "Click the droplet icon in the top-right menu bar to open stats & settings.",
    btn: "Get started",
  },
  ja: {
    title: "水飲みリマインダーへようこそ！",
    subtitle: "使い方のヒント：",
    step1Title: "水を記録",
    step1Desc: "コップが表示されたら、長押しまたは Space キーで飲水を記録します。",
    step2Title: "バックグラウンド常駐",
    step2Desc: "このウィンドウを閉じても、リマインダーはバックグラウンドで動き続けます。",
    step3TitleWin: "再度開く",
    step3DescWin: "右下のシステムトレイにある水滴アイコンをクリックすると、統計と設定を開けます。",
    step3TitleMac: "再度開く",
    step3DescMac: "右上のメニューバーにある水滴アイコンをクリックすると、統計と設定を開けます。",
    btn: "はじめる",
  },
};

// ===== 初始化 =====
(function init() {
  const { lang, platform } = window.welcomeApi.getInfo();
  const dict = WELCOME_I18N[lang] || WELCOME_I18N["zh-Hant"];
  const isMac = platform === "darwin";

  document.getElementById("w-title").textContent = dict.title;
  document.getElementById("w-subtitle").textContent = dict.subtitle;
  document.getElementById("s1-title").textContent = dict.step1Title;
  document.getElementById("s1-desc").textContent = dict.step1Desc;
  document.getElementById("s2-title").textContent = dict.step2Title;
  document.getElementById("s2-desc").textContent = dict.step2Desc;
  document.getElementById("s3-title").textContent = isMac ? dict.step3TitleMac : dict.step3TitleWin;
  document.getElementById("s3-desc").textContent = isMac ? dict.step3DescMac : dict.step3DescWin;
  document.getElementById("w-btn").textContent = dict.btn;

  document.getElementById("w-btn").addEventListener("click", () => {
    window.welcomeApi.done();
  });
})();
