// 避免在 iframe 中執行
if (window.top !== window.self) {
  // 在 iframe 中，不注入任何 UI
} else {
  (() => {
    // ===== CSS 字串 =====
    const STYLES = `
      :host {
        all: initial;
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        color: #333;
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
        gap: 8px;
      }

      /* 水杯 */
      .cup-wrapper {
        position: relative;
        width: 72px;
        height: 96px;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .cup-wrapper:hover {
        transform: scale(1.08);
      }
      .cup-wrapper:active {
        transform: scale(0.95);
      }

      .cup {
        position: absolute;
        bottom: 0;
        width: 72px;
        height: 88px;
        background: rgba(255, 255, 255, 0.85);
        border: 3px solid #4fc3f7;
        border-radius: 0 0 18px 18px;
        overflow: hidden;
        backdrop-filter: blur(6px);
        box-shadow: 0 4px 20px rgba(79, 195, 247, 0.25);
      }

      .cup-handle {
        position: absolute;
        right: -18px;
        top: 24px;
        width: 18px;
        height: 36px;
        border: 3px solid #4fc3f7;
        border-left: none;
        border-radius: 0 12px 12px 0;
      }

      .water {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(180deg, #4fc3f7 0%, #0288d1 100%);
        transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        border-radius: 0 0 15px 15px;
      }

      .water::before {
        content: "";
        position: absolute;
        top: -4px;
        left: 0;
        right: 0;
        height: 8px;
        background: rgba(255, 255, 255, 0.35);
        border-radius: 50%;
        animation: wave 2s ease-in-out infinite;
      }

      @keyframes wave {
        0%, 100% { transform: translateX(-2px) scaleY(1); }
        50% { transform: translateX(2px) scaleY(0.6); }
      }

      /* 進度文字 */
      .progress-text {
        font-size: 11px;
        font-weight: 600;
        color: #0288d1;
        text-align: center;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(255,255,255,0.8);
      }

      /* 提醒動畫 */
      .cup-wrapper.remind {
        animation: shake 0.6s ease-in-out 3;
      }

      @keyframes shake {
        0%, 100% { transform: rotate(0deg); }
        20% { transform: rotate(-12deg); }
        40% { transform: rotate(12deg); }
        60% { transform: rotate(-8deg); }
        80% { transform: rotate(8deg); }
      }

      /* 提示泡泡 */
      .reminder-bubble {
        position: absolute;
        bottom: 108px;
        right: 0;
        background: #fff;
        border: 2px solid #4fc3f7;
        border-radius: 16px;
        padding: 10px 16px;
        font-size: 13px;
        font-weight: 500;
        color: #0277bd;
        white-space: nowrap;
        box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.3s, transform 0.3s;
        pointer-events: none;
      }
      .reminder-bubble.show {
        opacity: 1;
        transform: translateY(0);
      }
      .reminder-bubble::after {
        content: "";
        position: absolute;
        bottom: -8px;
        right: 24px;
        width: 14px;
        height: 14px;
        background: #fff;
        border-right: 2px solid #4fc3f7;
        border-bottom: 2px solid #4fc3f7;
        transform: rotate(45deg);
      }

      /* +250ml 動畫 */
      .drink-splash {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        font-size: 14px;
        font-weight: 700;
        color: #0288d1;
        pointer-events: none;
        animation: splashUp 0.8s ease-out forwards;
      }

      @keyframes splashUp {
        0% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-40px); }
      }

      /* 收合按鈕 */
      .toggle-btn {
        position: absolute;
        top: -6px;
        left: -6px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid #4fc3f7;
        background: #fff;
        color: #0288d1;
        font-size: 12px;
        line-height: 16px;
        text-align: center;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 1;
      }
      .cup-wrapper:hover .toggle-btn {
        opacity: 1;
      }

      /* 收合狀態 */
      .drink-container.collapsed .cup-wrapper {
        width: 40px;
        height: 40px;
      }
      .drink-container.collapsed .cup {
        width: 40px;
        height: 36px;
        border-radius: 0 0 10px 10px;
      }
      .drink-container.collapsed .cup-handle {
        display: none;
      }
      .drink-container.collapsed .progress-text {
        display: none;
      }
      .drink-container.collapsed .toggle-btn {
        opacity: 1;
      }
    `;

    // ===== 建立 Shadow DOM =====
    const host = document.createElement("div");
    host.id = "drink-water-ext-host";
    const shadow = host.attachShadow({ mode: "closed" });

    // 注入樣式
    const styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    shadow.appendChild(styleEl);

    // ===== 建立 DOM 結構 =====
    const container = document.createElement("div");
    container.className = "drink-container";

    container.innerHTML = `
      <div class="reminder-bubble">該喝水囉！💧</div>
      <div class="cup-wrapper">
        <div class="toggle-btn">−</div>
        <div class="cup">
          <div class="water" style="height: 0%"></div>
        </div>
        <div class="cup-handle"></div>
      </div>
      <div class="progress-text">0 / 2000 ml</div>
    `;

    shadow.appendChild(container);
    document.body.appendChild(host);

    // ===== 元素參照 =====
    const cupWrapper = shadow.querySelector(".cup-wrapper");
    const waterEl = shadow.querySelector(".water");
    const progressText = shadow.querySelector(".progress-text");
    const bubble = shadow.querySelector(".reminder-bubble");
    const toggleBtn = shadow.querySelector(".toggle-btn");

    let collapsed = false;

    // ===== 更新 UI =====
    function updateUI(todayMl, dailyGoal) {
      const pct = Math.min((todayMl / dailyGoal) * 100, 100);
      waterEl.style.height = pct + "%";
      progressText.textContent = `${todayMl} / ${dailyGoal} ml`;
    }

    // 初始載入
    chrome.runtime.sendMessage({ type: "GET_STATUS" }, (res) => {
      if (res) updateUI(res.todayMl, res.dailyGoal);
    });

    // ===== 點擊喝水 =====
    cupWrapper.addEventListener("click", (e) => {
      if (e.target === toggleBtn) return;
      chrome.runtime.sendMessage({ type: "DRINK" }, (res) => {
        if (!res) return;
        chrome.runtime.sendMessage({ type: "GET_STATUS" }, (status) => {
          if (status) updateUI(status.todayMl, status.dailyGoal);
        });
        // +250ml 動畫
        const splash = document.createElement("span");
        splash.className = "drink-splash";
        splash.textContent = `+${res.todayMl - (res.todayMl - 250)}ml`;
        cupWrapper.appendChild(splash);
        setTimeout(() => splash.remove(), 800);
      });
    });

    // ===== 收合 / 展開 =====
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      collapsed = !collapsed;
      container.classList.toggle("collapsed", collapsed);
      toggleBtn.textContent = collapsed ? "+" : "−";
    });

    // ===== 接收提醒 =====
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "DRINK_REMINDER") {
        // 搖晃動畫
        cupWrapper.classList.add("remind");
        setTimeout(() => cupWrapper.classList.remove("remind"), 1800);

        // 顯示泡泡
        bubble.classList.add("show");
        setTimeout(() => bubble.classList.remove("show"), 5000);

        // 更新狀態
        chrome.runtime.sendMessage({ type: "GET_STATUS" }, (res) => {
          if (res) updateUI(res.todayMl, res.dailyGoal);
        });
      }
    });
  })();
}
