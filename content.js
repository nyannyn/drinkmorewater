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

      /* 水杯 — 無把手透明玻璃杯（上寬下窄） */
      .cup-wrapper {
        position: relative;
        width: 80px;
        height: 120px;
        cursor: pointer;
      }

      .cup-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
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

      /* 水位由 SVG 控制 */

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

    // 杯子形狀：上寬下窄的透明玻璃杯（參照 Duralex Unie）
    // 外形座標（viewBox 80x120）
    // 杯口: 左10 右70 (寬60), 杯底: 左18 右62 (寬44), 高度: 上8 下112
    container.innerHTML = `
      <div class="hint">🥤 長按杯子喝水！</div>
      <div class="cup-wrapper shaking">
        <svg class="cup-svg" viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- 杯子內部形狀（用於裁切水位） -->
            <clipPath id="cup-clip">
              <path d="M14 12 L66 12 L62 108 Q62 112 58 112 L22 112 Q18 112 18 108 Z"/>
            </clipPath>
            <!-- 玻璃質感漸層 -->
            <linearGradient id="glass-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="rgba(255,255,255,0.25)"/>
              <stop offset="30%" stop-color="rgba(255,255,255,0.08)"/>
              <stop offset="70%" stop-color="rgba(255,255,255,0.03)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0.2)"/>
            </linearGradient>
            <!-- 水的漸層 -->
            <linearGradient id="water-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#4fc3f7" stop-opacity="0.85"/>
              <stop offset="100%" stop-color="#0277bd" stop-opacity="0.95"/>
            </linearGradient>
          </defs>

          <!-- 水位（被裁切在杯內） -->
          <g clip-path="url(#cup-clip)">
            <rect class="water-rect" x="0" y="120" width="80" height="108" fill="url(#water-grad)"/>
            <!-- 水面波紋 -->
            <ellipse class="water-surface" cx="40" cy="120" rx="30" ry="3" fill="rgba(255,255,255,0.35)"/>
          </g>

          <!-- 杯身外框 -->
          <path d="M12 8 L68 8 L63 108 Q62 114 57 114 L23 114 Q18 114 17 108 Z"
                fill="none" stroke="rgba(180,180,180,0.6)" stroke-width="2.5"/>

          <!-- 杯口加粗邊（厚玻璃邊緣） -->
          <path d="M10 8 Q10 4 14 4 L66 4 Q70 4 70 8 L68 10 L12 10 Z"
                fill="rgba(200,200,200,0.3)" stroke="rgba(160,160,160,0.5)" stroke-width="1"/>

          <!-- 玻璃質感（高光） -->
          <path d="M14 12 L20 12 L22 108 L18 108 Z" fill="rgba(255,255,255,0.15)"/>

          <!-- 杯底厚度 -->
          <path d="M17 108 L63 108 L62 114 Q62 116 58 116 L22 116 Q18 116 18 114 Z"
                fill="rgba(180,180,180,0.2)" stroke="rgba(160,160,160,0.3)" stroke-width="1"/>
        </svg>

        <!-- 進度環 -->
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
    const waterRect = shadow.querySelector(".water-rect");
    const waterSurface = shadow.querySelector(".water-surface");
    const progressFg = shadow.querySelector(".progress-ring .fg");
    const hintEl = shadow.querySelector(".hint");

    // 水位控制：杯內空間從 y=12 到 y=112，總高 100
    const CUP_TOP = 12;
    const CUP_BOTTOM = 112;
    const CUP_HEIGHT = CUP_BOTTOM - CUP_TOP;

    function setWaterLevel(pct) {
      // pct: 0~1
      const waterH = CUP_HEIGHT * pct;
      const waterY = CUP_BOTTOM - waterH;
      waterRect.setAttribute("y", waterY);
      waterRect.setAttribute("height", waterH);
      waterSurface.setAttribute("cy", waterY);
    }

    setWaterLevel(0);

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
      setWaterLevel(0);
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
        setWaterLevel(0);
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
      hintEl.textContent = "💧 繼續按住...";

      holdTimer = setInterval(() => {
        const elapsed = Date.now() - holdStart;
        const progress = Math.min(elapsed / HOLD_DURATION_MS, 1);

        // 更新水位
        setWaterLevel(progress);

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
      setWaterLevel(0);
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
