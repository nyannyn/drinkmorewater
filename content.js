// 避免在 iframe 中執行
if (window.top !== window.self) {
  // 在 iframe 中，不注入任何 UI
} else {
  (() => {
    // ===== 常數 =====
    const HOLD_DURATION_MS = 3000; // 長按 3 秒 = 300ml
    const TICK_INTERVAL = 50; // 水位更新頻率

    // ===== CSS =====
    const STYLES = `
      :host {
        all: initial;
        position: fixed;
        bottom: 32px;
        left: 32px;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.4s ease;
      }
      :host(.active) {
        opacity: 1;
        pointer-events: auto;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .drink-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        user-select: none;
      }

      /* 提示文字 */
      .hint {
        font-size: 13px;
        font-weight: 600;
        color: #e65100;
        text-align: center;
        white-space: nowrap;
        text-shadow: 0 1px 3px rgba(255,255,255,0.9);
        animation: hintPulse 1.5s ease-in-out infinite;
      }
      @keyframes hintPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      /* 水杯 */
      .cup-wrapper {
        position: relative;
        width: 80px;
        height: 110px;
        cursor: pointer;
      }

      .cup {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 72px;
        height: 92px;
        background: rgba(255, 255, 255, 0.9);
        border: 3px solid #bdbdbd;
        border-radius: 4px 4px 18px 18px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }

      .cup-handle {
        position: absolute;
        right: -16px;
        top: 32px;
        width: 16px;
        height: 34px;
        border: 3px solid #bdbdbd;
        border-left: none;
        border-radius: 0 12px 12px 0;
      }

      /* 搖晃動畫 — 持續搖晃直到喝完 */
      .cup-wrapper.shaking {
        animation: shake 0.5s ease-in-out infinite;
        transform-origin: bottom center;
      }
      @keyframes shake {
        0%, 100% { transform: rotate(0deg); }
        15% { transform: rotate(-8deg); }
        30% { transform: rotate(8deg); }
        45% { transform: rotate(-6deg); }
        60% { transform: rotate(6deg); }
        75% { transform: rotate(-3deg); }
        90% { transform: rotate(3deg); }
      }

      /* 水位 */
      .water {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 0%;
        background: linear-gradient(180deg, #4fc3f7 0%, #0288d1 100%);
        border-radius: 0 0 15px 15px;
        transition: none;
      }
      .water.filling {
        /* 填水中不用 transition，由 JS 控制 */
      }
      .water.resetting {
        transition: height 0.3s ease-out;
      }

      .water::before {
        content: "";
        position: absolute;
        top: -3px;
        left: 0;
        right: 0;
        height: 6px;
        background: rgba(255, 255, 255, 0.4);
        border-radius: 50%;
      }

      /* 進度環 */
      .progress-ring {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 32px;
        height: 32px;
      }
      .progress-ring circle {
        fill: none;
        stroke-width: 3;
      }
      .progress-ring .bg {
        stroke: #e0e0e0;
      }
      .progress-ring .fg {
        stroke: #4fc3f7;
        stroke-linecap: round;
        transform: rotate(-90deg);
        transform-origin: center;
        transition: none;
      }

      /* 完成動畫 */
      .cup-wrapper.done {
        animation: celebrate 0.6s ease-out;
      }
      @keyframes celebrate {
        0% { transform: scale(1); }
        30% { transform: scale(1.15); }
        60% { transform: scale(0.95); }
        100% { transform: scale(1); }
      }

      .done-text {
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 16px;
        font-weight: 700;
        color: #2e7d32;
        white-space: nowrap;
        pointer-events: none;
        animation: floatUp 1s ease-out forwards;
      }
      @keyframes floatUp {
        0% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-50px); }
      }
    `;

    // ===== 枯萎游標 CSS（注入到頁面 document，非 Shadow DOM） =====
    const CURSOR_STYLE_ID = "drink-water-ext-cursor";
    const WITHERED_CURSOR = `
      /* 枯萎的黃色游標 — SVG data URI */
      * {
        cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M3 2 L8 22 L12 16 L20 18 Z' fill='%23c8a415' stroke='%23806a00' stroke-width='1.2'/%3E%3Cpath d='M5 5 L8 18' stroke='%23a08200' stroke-width='0.5' opacity='0.5'/%3E%3C/svg%3E") 4 2, auto !important;
      }
    `;

    // ===== 建立 Shadow DOM =====
    const host = document.createElement("div");
    host.id = "drink-water-ext-host";
    const shadow = host.attachShadow({ mode: "closed" });

    const styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    shadow.appendChild(styleEl);

    // ===== DOM 結構 =====
    const container = document.createElement("div");
    container.className = "drink-container";

    const circumference = 2 * Math.PI * 13; // r=13

    container.innerHTML = `
      <div class="hint">🥤 長按杯子喝水！</div>
      <div class="cup-wrapper shaking">
        <div class="cup">
          <div class="water"></div>
        </div>
        <div class="cup-handle"></div>
        <svg class="progress-ring" viewBox="0 0 32 32">
          <circle class="bg" cx="16" cy="16" r="13"/>
          <circle class="fg" cx="16" cy="16" r="13"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference}"/>
        </svg>
      </div>
    `;

    shadow.appendChild(container);
    document.body.appendChild(host);

    // ===== 元素參照 =====
    const cupWrapper = shadow.querySelector(".cup-wrapper");
    const waterEl = shadow.querySelector(".water");
    const progressFg = shadow.querySelector(".progress-ring .fg");
    const hintEl = shadow.querySelector(".hint");

    // ===== 狀態 =====
    let isThirsty = false; // 是否處於口渴模式
    let isHolding = false;
    let holdStart = 0;
    let holdTimer = null;

    // ===== 啟動口渴模式 =====
    function activateThirstMode() {
      if (isThirsty) return;
      isThirsty = true;

      // 顯示水杯
      host.classList.add("active");
      cupWrapper.classList.add("shaking");

      // 注入枯萎游標
      let cursorStyle = document.getElementById(CURSOR_STYLE_ID);
      if (!cursorStyle) {
        cursorStyle = document.createElement("style");
        cursorStyle.id = CURSOR_STYLE_ID;
        cursorStyle.textContent = WITHERED_CURSOR;
        document.head.appendChild(cursorStyle);
      }

      // 重設水位
      waterEl.style.height = "0%";
      progressFg.style.strokeDashoffset = circumference;
      hintEl.textContent = "🥤 長按杯子喝水！";
    }

    // ===== 解除口渴模式 =====
    function deactivateThirstMode() {
      isThirsty = false;

      // 移除枯萎游標
      const cursorStyle = document.getElementById(CURSOR_STYLE_ID);
      if (cursorStyle) cursorStyle.remove();

      // 完成動畫
      cupWrapper.classList.remove("shaking");
      cupWrapper.classList.add("done");

      const doneText = document.createElement("span");
      doneText.className = "done-text";
      doneText.textContent = "+300ml ✓";
      cupWrapper.appendChild(doneText);

      // 通知 background 喝完了
      chrome.runtime.sendMessage({ type: "DRINK_COMPLETE" });

      // 1.5 秒後隱藏
      setTimeout(() => {
        host.classList.remove("active");
        cupWrapper.classList.remove("done");
        doneText.remove();
        waterEl.style.height = "0%";
        progressFg.style.strokeDashoffset = circumference;
      }, 1500);
    }

    // ===== 長按邏輯 =====
    function startHold(e) {
      e.preventDefault();
      if (!isThirsty) return;

      isHolding = true;
      holdStart = Date.now();
      cupWrapper.classList.remove("shaking");
      waterEl.classList.remove("resetting");
      waterEl.classList.add("filling");
      hintEl.textContent = "💧 繼續按住...";

      holdTimer = setInterval(() => {
        const elapsed = Date.now() - holdStart;
        const progress = Math.min(elapsed / HOLD_DURATION_MS, 1);

        // 更新水位
        waterEl.style.height = (progress * 100) + "%";

        // 更新進度環
        const offset = circumference * (1 - progress);
        progressFg.style.strokeDashoffset = offset;

        // 按滿 3 秒
        if (progress >= 1) {
          clearInterval(holdTimer);
          holdTimer = null;
          isHolding = false;
          deactivateThirstMode();
        }
      }, TICK_INTERVAL);
    }

    function endHold() {
      if (!isHolding) return;
      isHolding = false;
      clearInterval(holdTimer);
      holdTimer = null;

      // 中途放開 → 水位歸零，繼續搖晃
      waterEl.classList.remove("filling");
      waterEl.classList.add("resetting");
      waterEl.style.height = "0%";
      progressFg.style.strokeDashoffset = circumference;
      cupWrapper.classList.add("shaking");
      hintEl.textContent = "😤 還沒喝完！繼續按！";
    }

    // 滑鼠事件
    cupWrapper.addEventListener("mousedown", startHold);
    document.addEventListener("mouseup", endHold);

    // 觸控支援
    cupWrapper.addEventListener("touchstart", (e) => {
      startHold(e);
    }, { passive: false });
    document.addEventListener("touchend", endHold);
    document.addEventListener("touchcancel", endHold);

    // 防止長按拖曳
    cupWrapper.addEventListener("dragstart", (e) => e.preventDefault());
    cupWrapper.addEventListener("selectstart", (e) => e.preventDefault());

    // ===== 接收提醒 =====
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "DRINK_REMINDER") {
        activateThirstMode();
      }
    });
  })();
}
