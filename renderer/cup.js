// ===== 常數 =====
const HOLD_DURATION_MS = 3000; // 長按 3 秒 = 300ml
const MAX_ML = 300;
const TICK_INTERVAL = 50;
const SHATTER_TIMEOUT_MS = 60000; // 1 分鐘不理會自動碎裂

const CUP_TOP = 14;
const CUP_BOTTOM = 118;
const CUP_HEIGHT = CUP_BOTTOM - CUP_TOP;

// ===== 元素參照 =====
const body = document.body;
const container = document.querySelector(".drink-container");
const cupWrapper = document.querySelector(".cup-wrapper");
const waterRect = document.querySelector(".water-rect");
const waterWave = document.querySelector(".water-wave");
const progressFg = document.querySelector(".progress-ring .fg");
const hintEl = document.querySelector(".hint");
const bubbles = document.querySelectorAll(".bubble");

const circumference = 2 * Math.PI * 13;
progressFg.setAttribute("stroke-dasharray", circumference);
progressFg.setAttribute("stroke-dashoffset", circumference);

function setWaterLevel(pct) {
  const waterH = CUP_HEIGHT * pct;
  const waterY = CUP_BOTTOM - waterH;
  waterRect.setAttribute("y", waterY);
  waterRect.setAttribute("height", waterH);
  if (waterWave) {
    const y = waterY;
    waterWave.setAttribute(
      "d",
      `M0 ${y} Q12 ${y - 3} 22 ${y} T45 ${y} T68 ${y} T90 ${y} L90 ${y + 2} L0 ${y + 2} Z`
    );
  }
  bubbles.forEach((b) => {
    b.style.display = pct > 0.05 ? "" : "none";
  });
}

setWaterLevel(0);

// ===== 狀態 =====
let isThirsty = false;
let isHolding = false;
let holdStart = 0;
let holdTimer = null;
let shatterTimer = null;

// ===== 叮！音效（移植自 offscreen.js，喝滿時播放） =====
function playDingSound(volume = 1) {
  const ctx = new AudioContext();
  const now = ctx.currentTime;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, now);
  masterGain.connect(ctx.destination);

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(1200, now);
  osc1.frequency.exponentialRampToValueAtTime(800, now + 0.3);
  gain1.gain.setValueAtTime(0.4, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  osc1.connect(gain1);
  gain1.connect(masterGain);
  osc1.start(now);
  osc1.stop(now + 0.6);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(2400, now);
  osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.2);
  gain2.gain.setValueAtTime(0.15, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc2.connect(gain2);
  gain2.connect(masterGain);
  osc2.start(now);
  osc2.stop(now + 0.3);

  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = "sine";
  osc3.frequency.setValueAtTime(1500, now + 0.15);
  osc3.frequency.exponentialRampToValueAtTime(1000, now + 0.5);
  gain3.gain.setValueAtTime(0, now);
  gain3.gain.setValueAtTime(0.3, now + 0.15);
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
  osc3.connect(gain3);
  gain3.connect(masterGain);
  osc3.start(now + 0.15);
  osc3.stop(now + 0.7);
}

async function maybePlayDing() {
  try {
    const { soundEnabled, soundVolume } = await window.cupApi.getSoundSettings();
    if (soundEnabled) playDingSound((soundVolume ?? 80) / 100);
  } catch {}
}

// ===== 啟動口渴模式 =====
function activateThirstMode() {
  if (isThirsty) return;
  isThirsty = true;

  body.classList.add("active", "thirsty");
  cupWrapper.classList.add("shaking");
  cupWrapper.style.display = "";

  setWaterLevel(0);
  progressFg.style.strokeDashoffset = circumference;
  hintEl.textContent = "🥤 長按杯子或按 Space 喝水！";

  clearTimeout(shatterTimer);
  shatterTimer = setTimeout(() => {
    if (isThirsty && !isHolding) shatterAndDismiss();
  }, SHATTER_TIMEOUT_MS);
}

function dismissWindow() {
  body.classList.remove("active", "thirsty");
  window.cupApi.dismissed();
}

// ===== 解除口渴模式（喝了水） =====
function drinkAndDismiss(progress) {
  isThirsty = false;
  clearTimeout(shatterTimer);

  const ml = Math.round(MAX_ML * progress);
  if (ml <= 0) return;

  cupWrapper.classList.remove("shaking");
  cupWrapper.classList.add("done");

  const doneText = document.createElement("span");
  doneText.className = "done-text";
  doneText.textContent = `+${ml}ml`;
  cupWrapper.appendChild(doneText);

  window.cupApi.drinkComplete(ml);
  if (progress >= 1) maybePlayDing();

  setTimeout(() => {
    cupWrapper.classList.remove("done");
    doneText.remove();
    setWaterLevel(0);
    progressFg.style.strokeDashoffset = circumference;
    dismissWindow();
  }, 1500);
}

// ===== 碎裂動畫（三階段） =====
function shatterAndDismiss() {
  isThirsty = false;
  clearTimeout(shatterTimer);

  cupWrapper.classList.remove("shaking");
  hintEl.textContent = "";

  // ── Phase 1：裂痕 + 微震 ──
  cupWrapper.classList.add("stress");

  const crackSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  crackSvg.setAttribute("viewBox", "0 0 80 120");
  crackSvg.classList.add("crack-line");

  const crackPaths = [
    { x1: 40, y1: 50, x2: 25, y2: 20 },
    { x1: 40, y1: 50, x2: 60, y2: 15 },
    { x1: 40, y1: 50, x2: 55, y2: 85 },
    { x1: 40, y1: 50, x2: 20, y2: 90 },
    { x1: 40, y1: 50, x2: 65, y2: 55 },
    { x1: 35, y1: 45, x2: 18, y2: 55 },
  ];

  crackPaths.forEach((p, i) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", p.x1);
    line.setAttribute("y1", p.y1);
    line.setAttribute("x2", p.x2);
    line.setAttribute("y2", p.y2);
    const len = Math.hypot(p.x2 - p.x1, p.y2 - p.y1);
    line.style.strokeDasharray = len;
    line.style.setProperty("--len", len);
    line.style.animationDelay = i * 50 + "ms";
    crackSvg.appendChild(line);
  });

  cupWrapper.appendChild(crackSvg);

  // ── Phase 2：碎片飛散 ──
  setTimeout(() => {
    cupWrapper.style.display = "none";
    cupWrapper.classList.remove("stress");
    crackSvg.remove();

    const shatterBox = document.createElement("div");
    shatterBox.className = "shatter-container";

    const shardColors = [
      "rgba(180,190,200,0.55)",
      "rgba(200,215,230,0.65)",
      "rgba(160,175,190,0.45)",
      "rgba(220,230,240,0.55)",
      "rgba(190,205,215,0.5)",
      "rgba(170,185,200,0.4)",
    ];

    const shardCount = 14;
    for (let i = 0; i < shardCount; i++) {
      const shard = document.createElement("div");
      shard.className = "shard";

      const startX = 12 + Math.random() * 56;
      const startY = 15 + Math.random() * 90;
      shard.style.left = startX + "px";
      shard.style.top = startY + "px";

      const tx = (Math.random() - 0.5) * 180 + "px";
      const ty = (Math.random() * 0.7 + 0.3) * 140 + "px";
      const rot = (Math.random() - 0.5) * 540 + "deg";
      const delay = Math.random() * 120 + "ms";
      const dur = 0.5 + Math.random() * 0.4 + "s";

      shard.style.setProperty("--tx", tx);
      shard.style.setProperty("--ty", ty);
      shard.style.setProperty("--rot", rot);
      shard.style.setProperty("--delay", delay);
      shard.style.setProperty("--dur", dur);

      const size = 8 + Math.random() * 18;
      const color = shardColors[i % shardColors.length];
      const isQuad = Math.random() > 0.4;

      let points;
      if (isQuad) {
        points = [
          `${Math.random() * size * 0.4},${Math.random() * size * 0.3}`,
          `${size * (0.5 + Math.random() * 0.5)},${Math.random() * size * 0.4}`,
          `${size * (0.6 + Math.random() * 0.4)},${size * (0.6 + Math.random() * 0.4)}`,
          `${Math.random() * size * 0.3},${size * (0.5 + Math.random() * 0.5)}`,
        ].join(" ");
      } else {
        points = [
          `${Math.random() * size},0`,
          `${size},${size * (0.5 + Math.random() * 0.5)}`,
          `0,${size * (0.4 + Math.random() * 0.6)}`,
        ].join(" ");
      }

      shard.innerHTML = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <polygon points="${points}" fill="${color}" stroke="rgba(180,190,200,0.7)" stroke-width="0.5"/>
        </svg>`;
      shatterBox.appendChild(shard);
    }

    for (let i = 0; i < 6; i++) {
      const dust = document.createElement("div");
      dust.className = "dust";
      dust.style.left = 20 + Math.random() * 40 + "px";
      dust.style.top = 30 + Math.random() * 60 + "px";
      dust.style.setProperty("--size", 2 + Math.random() * 3 + "px");
      dust.style.setProperty("--tx", (Math.random() - 0.5) * 60 + "px");
      dust.style.setProperty("--ty", Math.random() * 40 + 20 + "px");
      dust.style.setProperty("--delay", Math.random() * 200 + 100 + "ms");
      dust.style.setProperty("--dur", 0.8 + Math.random() * 0.6 + "s");
      shatterBox.appendChild(dust);
    }

    container.appendChild(shatterBox);

    // ── Phase 3：清除 ──
    setTimeout(() => {
      shatterBox.remove();
      cupWrapper.style.display = "";
      setWaterLevel(0);
      progressFg.style.strokeDashoffset = circumference;
      dismissWindow();
    }, 1200);
  }, 400);
}

// ===== 長按邏輯 =====
function startHold(e) {
  e.preventDefault();
  if (!isThirsty) return;

  clearTimeout(shatterTimer);

  isHolding = true;
  holdStart = Date.now();
  cupWrapper.classList.remove("shaking");
  hintEl.textContent = "💧 繼續按住...";

  holdTimer = setInterval(() => {
    const elapsed = Date.now() - holdStart;
    const progress = Math.min(elapsed / HOLD_DURATION_MS, 1);

    setWaterLevel(progress);
    progressFg.style.strokeDashoffset = circumference * (1 - progress);

    if (progress >= 1) {
      clearInterval(holdTimer);
      holdTimer = null;
      isHolding = false;
      drinkAndDismiss(1);
    }
  }, TICK_INTERVAL);
}

function endHold() {
  if (!isHolding) return;

  const elapsed = Date.now() - holdStart;
  const progress = Math.min(elapsed / HOLD_DURATION_MS, 1);

  isHolding = false;
  clearInterval(holdTimer);
  holdTimer = null;

  if (progress >= 0.05) {
    drinkAndDismiss(progress);
  } else {
    setWaterLevel(0);
    progressFg.style.strokeDashoffset = circumference;
    cupWrapper.classList.add("shaking");
    hintEl.textContent = "😤 再按久一點！";

    clearTimeout(shatterTimer);
    shatterTimer = setTimeout(() => {
      if (isThirsty && !isHolding) shatterAndDismiss();
    }, SHATTER_TIMEOUT_MS);
  }
}

cupWrapper.addEventListener("mousedown", startHold);
document.addEventListener("mouseup", endHold);
cupWrapper.addEventListener("dragstart", (e) => e.preventDefault());
cupWrapper.addEventListener("selectstart", (e) => e.preventDefault());

// ===== 鍵盤快捷鍵（視窗取得焦點時生效） =====
document.addEventListener("keydown", (e) => {
  if (!isThirsty || isHolding) return;
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    drinkAndDismiss(1);
  }
});

// ===== 接收提醒 =====
window.cupApi.onReminder(() => activateThirstMode());
