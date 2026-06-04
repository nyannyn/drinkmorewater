// ===== 可替換的杯子樣式模組 =====
// 每個樣式自帶 SVG defs / 杯身 / 水面 clipPath，
// cup.js 動態套用後會重新查詢 .water-rect / .water-wave / .bubble 元素。
//
// 每個樣式需提供：
//   id           : 識別字串（與 prefs.cupStyle 對應）
//   viewBox      : SVG viewBox
//   waterTop     : 水面最高 y（滿）
//   waterBottom  : 水面最低 y（空）
//   icon         : 偏好設定預覽用 emoji
//   svg          : <svg> 內部 HTML（必須含 #cup-clip、.water-rect、.water-wave、.bubble）

const SHARED_WATER_DEFS = `
  <linearGradient id="water-grad" x1="0" y1="0" x2="0.15" y2="1">
    <stop offset="0%" stop-color="#4dd0e1" stop-opacity="0.85" />
    <stop offset="30%" stop-color="#26c6da" stop-opacity="0.9" />
    <stop offset="70%" stop-color="#00acc1" stop-opacity="0.92" />
    <stop offset="100%" stop-color="#00838f" stop-opacity="0.95" />
  </linearGradient>
`;

// 共用水體 + 波浪 + 氣泡（位置在 cup-clip 內就會被遮罩，所以可放心橫跨 0~90）
function makeWaterLayer(gradId = "water-grad") {
  return `
    <g clip-path="url(#cup-clip)">
      <rect class="water-rect" x="0" y="118" width="90" height="0" fill="url(#${gradId})" />
      <g class="wave-group">
        <path class="water-wave"
              d="M0 118 Q12 115 22 118 T45 118 T68 118 T90 118 L90 120 L0 120 Z"
              fill="rgba(255,255,255,0.25)" />
      </g>
      <circle class="bubble" cx="32" cy="100" r="1.5" fill="rgba(255,255,255,0.5)"
              style="--dur:2.5s;--delay:0s;--rise:-25px" />
      <circle class="bubble" cx="48" cy="105" r="1" fill="rgba(255,255,255,0.4)"
              style="--dur:3s;--delay:0.8s;--rise:-30px" />
      <circle class="bubble" cx="40" cy="95" r="2" fill="rgba(255,255,255,0.35)"
              style="--dur:2.8s;--delay:1.5s;--rise:-35px" />
      <circle class="bubble" cx="42" cy="100" r="1.2" fill="rgba(255,255,255,0.45)"
              style="--dur:3.2s;--delay:0.3s;--rise:-28px" />
    </g>
  `;
}
const WATER_LAYER = makeWaterLayer();

// ─────────────────────────────────────────────
// 1. 經典毛玻璃杯（原版）
// ─────────────────────────────────────────────
const CLASSIC = {
  id: "classic",
  viewBox: "0 0 90 130",
  waterTop: 14,
  waterBottom: 118,
  icon: "🥤",
  svg: `
    <defs>
      <clipPath id="cup-clip">
        <path d="M16 14 L74 14 L70 112 Q69 118 64 118 L26 118 Q21 118 20 112 Z" />
      </clipPath>
      ${SHARED_WATER_DEFS}
      <linearGradient id="glass-body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.18)" />
        <stop offset="30%" stop-color="rgba(255,255,255,0.08)" />
        <stop offset="60%" stop-color="rgba(200,225,255,0.1)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0.05)" />
      </linearGradient>
      <linearGradient id="highlight-l" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(255,255,255,0.5)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0)" />
      </linearGradient>
      <linearGradient id="highlight-r" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%" stop-color="rgba(255,255,255,0.2)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0)" />
      </linearGradient>
      <radialGradient id="rim-grad" cx="0.5" cy="0.3" r="0.6">
        <stop offset="0%" stop-color="rgba(255,255,255,0.5)" />
        <stop offset="60%" stop-color="rgba(220,235,250,0.3)" />
        <stop offset="100%" stop-color="rgba(180,200,220,0.15)" />
      </radialGradient>
      <linearGradient id="glass-edge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(200,220,255,0.6)" />
        <stop offset="50%" stop-color="rgba(180,200,230,0.3)" />
        <stop offset="100%" stop-color="rgba(160,180,210,0.4)" />
      </linearGradient>
      <filter id="glass-blur" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <!-- 杯身玻璃態 -->
    <path d="M16 14 L74 14 L70 112 Q69 118 64 118 L26 118 Q21 118 20 112 Z"
          fill="url(#glass-body)" filter="url(#glass-blur)" />
    ${WATER_LAYER}
    <!-- 玻璃邊框（微光邊緣） -->
    <path d="M15 12 L75 12 L71 112 Q70 119 64 119 L26 119 Q20 119 19 112 Z"
          fill="none" stroke="url(#glass-edge)" stroke-width="1.5" />
    <!-- 左側高光反射 -->
    <path d="M18 16 Q16 14 19 14 L23 14 L24 16 L25 106 Q25 112 26 114 L22 114 Q20 110 20 106 Z"
          fill="url(#highlight-l)" />
    <!-- 右側淡反射 -->
    <path d="M66 20 L69 20 L67 106 Q66 112 65 114 L63 114 Q64 110 64 106 Z"
          fill="url(#highlight-r)" />
    <!-- 杯口光環 -->
    <ellipse cx="45" cy="12" rx="31" ry="5" fill="url(#rim-grad)"
             stroke="rgba(200,220,255,0.5)" stroke-width="1.2" />
    <!-- 杯底 -->
    <path d="M19 112 L71 112 L69 119 Q68 122 64 122 L26 122 Q22 122 21 119 Z"
          fill="rgba(200,215,240,0.12)" stroke="rgba(180,200,230,0.25)" stroke-width="1" />
    <path d="M22 114 L68 114 L67 118 Q66 120 63 120 L27 120 Q24 120 23 118 Z"
          fill="rgba(220,235,255,0.08)" />
    <!-- 底部光暈 -->
    <ellipse cx="45" cy="124" rx="22" ry="3" fill="rgba(77,208,225,0.06)" />
  `,
};

// ─────────────────────────────────────────────
// 2. 陶瓷馬克杯（含把手 + 熱氣）
// ─────────────────────────────────────────────
const MUG = {
  id: "mug",
  viewBox: "0 0 90 130",
  waterTop: 30,
  waterBottom: 110,
  icon: "☕",
  svg: `
    <defs>
      <clipPath id="cup-clip">
        <path d="M20 30 L62 30 L60 108 Q59 112 55 112 L27 112 Q23 112 22 108 Z" />
      </clipPath>
      ${SHARED_WATER_DEFS}
      <linearGradient id="mug-body" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f8f9fa" />
        <stop offset="50%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#dde1e6" />
      </linearGradient>
    </defs>
    <!-- 熱氣 -->
    <g opacity="0.55">
      <path d="M30 22 Q34 16 30 8 Q26 4 30 -2"
            stroke="rgba(255,255,255,0.85)" stroke-width="2" fill="none" stroke-linecap="round" />
      <path d="M42 24 Q46 18 42 10 Q38 6 42 0"
            stroke="rgba(255,255,255,0.85)" stroke-width="2" fill="none" stroke-linecap="round" />
      <path d="M54 22 Q58 16 54 8 Q50 4 54 -2"
            stroke="rgba(255,255,255,0.85)" stroke-width="2" fill="none" stroke-linecap="round" />
    </g>
    <!-- 把手 -->
    <path d="M62 44 Q82 44 82 64 Q82 86 62 88"
          fill="none" stroke="#cdd2d8" stroke-width="7" stroke-linecap="round" />
    <path d="M62 48 Q77 48 77 64 Q77 82 62 84"
          fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
    <!-- 杯身 -->
    <path d="M20 30 L62 30 L60 108 Q59 112 55 112 L27 112 Q23 112 22 108 Z"
          fill="url(#mug-body)" stroke="#bfc5cc" stroke-width="1.5" />
    <!-- 杯口 -->
    <ellipse cx="41" cy="30" rx="21" ry="4.5" fill="#f1f3f5" stroke="#bfc5cc" stroke-width="1.5" />
    ${WATER_LAYER}
    <!-- 側邊高光 -->
    <path d="M25 38 L26 100" stroke="rgba(255,255,255,0.85)" stroke-width="2" stroke-linecap="round" />
    <!-- 底部陰影 -->
    <ellipse cx="41" cy="117" rx="20" ry="3" fill="rgba(0,0,0,0.1)" />
  `,
};

// ─────────────────────────────────────────────
// 3. 珍珠奶茶杯（圓頂蓋 + 吸管 + 珍珠裝飾）
// ─────────────────────────────────────────────
const BOBA = {
  id: "boba",
  viewBox: "0 0 90 130",
  waterTop: 30,
  waterBottom: 118,
  icon: "🧋",
  svg: `
    <defs>
      <clipPath id="cup-clip">
        <path d="M22 30 L66 30 L60 116 Q59 120 54 120 L34 120 Q29 120 28 116 Z" />
      </clipPath>
      <linearGradient id="boba-grad" x1="0" y1="0" x2="0.1" y2="1">
        <stop offset="0%" stop-color="#e8caa0" stop-opacity="0.9" />
        <stop offset="50%" stop-color="#b88761" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#6b4a2e" stop-opacity="0.97" />
      </linearGradient>
    </defs>
    <!-- 吸管 -->
    <rect x="48" y="-2" width="6" height="36" rx="1.5" fill="#ec4899" />
    <rect x="49" y="-2" width="2" height="36" fill="rgba(255,255,255,0.5)" />
    <!-- 杯身 -->
    <path d="M22 30 L66 30 L60 116 Q59 120 54 120 L34 120 Q29 120 28 116 Z"
          fill="rgba(255,255,255,0.18)" stroke="rgba(120,130,140,0.7)" stroke-width="1.6" />
    <!-- 圓頂蓋 -->
    <path d="M18 30 L70 30 Q70 18 60 14 Q54 10 44 10 Q34 10 30 14 Q18 18 18 30 Z"
          fill="rgba(230,238,245,0.55)" stroke="rgba(120,130,140,0.7)" stroke-width="1.6" />
    <ellipse cx="34" cy="20" rx="7" ry="2.5" fill="rgba(255,255,255,0.7)" />
    ${makeWaterLayer("boba-grad")}
    <!-- 珍珠（位於水層之上，永遠看得到，像漂浮的 boba） -->
    <g clip-path="url(#cup-clip)">
      <circle cx="35" cy="112" r="2.4" fill="#3a2418" />
      <circle cx="41" cy="114" r="2.6" fill="#2a180f" />
      <circle cx="47" cy="112" r="2.4" fill="#3a2418" />
      <circle cx="53" cy="114" r="2.2" fill="#2a180f" />
      <circle cx="38" cy="108" r="2" fill="#3a2418" />
      <circle cx="50" cy="108" r="2" fill="#2a180f" />
      <circle cx="44" cy="106" r="2" fill="#3a2418" />
    </g>
    <!-- 側邊高光 -->
    <path d="M27 36 L28 108" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round" />
    <!-- 底部陰影 -->
    <ellipse cx="44" cy="124" rx="17" ry="2.5" fill="rgba(0,0,0,0.1)" />
  `,
};

// ─────────────────────────────────────────────
// 4. 實驗瓶 / Erlenmeyer 燒瓶
// ─────────────────────────────────────────────
const FLASK = {
  id: "flask",
  viewBox: "0 0 90 130",
  waterTop: 42,
  waterBottom: 118,
  icon: "🧪",
  svg: `
    <defs>
      <clipPath id="cup-clip">
        <path d="M36 42 L36 62 L18 110 Q16 118 22 118 L68 118 Q74 118 72 110 L54 62 L54 42 Z" />
      </clipPath>
      ${SHARED_WATER_DEFS}
    </defs>
    <!-- 燒瓶身 -->
    <path d="M36 42 L36 62 L18 110 Q16 118 22 118 L68 118 Q74 118 72 110 L54 62 L54 42 Z"
          fill="rgba(255,255,255,0.12)" stroke="rgba(110,130,150,0.8)" stroke-width="1.6" />
    <!-- 頸部 -->
    <path d="M34 14 L34 42 L56 42 L56 14 Z"
          fill="rgba(255,255,255,0.08)" stroke="rgba(110,130,150,0.8)" stroke-width="1.6" />
    <!-- 瓶口 -->
    <ellipse cx="45" cy="14" rx="11" ry="3.2" fill="rgba(220,230,240,0.45)"
             stroke="rgba(110,130,150,0.85)" stroke-width="1.6" />
    <!-- 刻度線 -->
    <g stroke="rgba(110,130,150,0.7)" stroke-width="1" fill="none" stroke-linecap="round">
      <line x1="22" y1="104" x2="28" y2="104" />
      <line x1="24" y1="94" x2="28" y2="94" />
      <line x1="26" y1="84" x2="30" y2="84" />
      <line x1="28" y1="74" x2="32" y2="74" />
    </g>
    ${WATER_LAYER}
    <!-- 側邊高光 -->
    <path d="M40 46 Q32 80 26 108" stroke="rgba(255,255,255,0.55)"
          stroke-width="1.6" stroke-linecap="round" fill="none" />
    <!-- 底部陰影 -->
    <ellipse cx="45" cy="124" rx="26" ry="3" fill="rgba(0,0,0,0.12)" />
  `,
};

// ─────────────────────────────────────────────
// 5. 運動水壺（標籤 + 黑色瓶蓋）
// ─────────────────────────────────────────────
const BOTTLE = {
  id: "bottle",
  viewBox: "0 0 90 130",
  waterTop: 32,
  waterBottom: 118,
  icon: "🍶",
  svg: `
    <defs>
      <clipPath id="cup-clip">
        <path d="M28 32 L62 32 L62 116 Q62 120 58 120 L32 120 Q28 120 28 116 Z" />
      </clipPath>
      ${SHARED_WATER_DEFS}
      <linearGradient id="bottle-cap" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#374151" />
        <stop offset="100%" stop-color="#111827" />
      </linearGradient>
    </defs>
    <!-- 瓶蓋 -->
    <rect x="32" y="4" width="26" height="20" rx="2.5" fill="url(#bottle-cap)" />
    <rect x="32" y="8" width="26" height="1.2" fill="rgba(255,255,255,0.12)" />
    <rect x="32" y="13" width="26" height="1" fill="rgba(255,255,255,0.08)" />
    <rect x="32" y="18" width="26" height="1" fill="rgba(255,255,255,0.08)" />
    <!-- 瓶頸 -->
    <rect x="34" y="24" width="22" height="10" fill="rgba(220,230,240,0.4)"
          stroke="rgba(110,130,150,0.65)" stroke-width="1.2" />
    <!-- 瓶身 -->
    <path d="M28 32 L62 32 L62 116 Q62 120 58 120 L32 120 Q28 120 28 116 Z"
          fill="rgba(220,230,240,0.25)" stroke="rgba(110,130,150,0.65)" stroke-width="1.5" />
    ${WATER_LAYER}
    <!-- 標籤 -->
    <rect x="30" y="60" width="30" height="24" fill="rgba(59,130,246,0.78)" rx="2.5" />
    <text x="45" y="76" fill="#fff" font-size="9" font-family="sans-serif"
          font-weight="700" text-anchor="middle" letter-spacing="0.5">H2O</text>
    <!-- 側邊高光 -->
    <path d="M32 38 L32 110" stroke="rgba(255,255,255,0.55)" stroke-width="1.8" stroke-linecap="round" />
    <path d="M58 50 L58 100" stroke="rgba(255,255,255,0.25)" stroke-width="1" stroke-linecap="round" />
    <!-- 底部陰影 -->
    <ellipse cx="45" cy="124" rx="18" ry="2.5" fill="rgba(0,0,0,0.1)" />
  `,
};

window.CUP_STYLES = {
  classic: CLASSIC,
  mug: MUG,
  boba: BOBA,
  flask: FLASK,
  bottle: BOTTLE,
};

window.CUP_STYLE_ORDER = ["classic", "mug", "boba", "flask", "bottle"];

window.getCupStyle = function (id) {
  return window.CUP_STYLES[id] || window.CUP_STYLES.classic;
};
