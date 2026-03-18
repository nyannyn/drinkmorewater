// 清脆的「叮！」音效 — 使用 Web Audio API
function playDingSound() {
  const ctx = new AudioContext();
  const now = ctx.currentTime;

  // 主音：高頻 sine wave（清脆的叮）
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(1200, now);
  osc1.frequency.exponentialRampToValueAtTime(800, now + 0.3);
  gain1.gain.setValueAtTime(0.4, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.6);

  // 泛音：增加清脆感
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(2400, now);
  osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.2);
  gain2.gain.setValueAtTime(0.15, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + 0.3);

  // 第二聲叮（稍延遲）
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = "sine";
  osc3.frequency.setValueAtTime(1500, now + 0.15);
  osc3.frequency.exponentialRampToValueAtTime(1000, now + 0.5);
  gain3.gain.setValueAtTime(0, now);
  gain3.gain.setValueAtTime(0.3, now + 0.15);
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
  osc3.connect(gain3);
  gain3.connect(ctx.destination);
  osc3.start(now + 0.15);
  osc3.stop(now + 0.7);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "PLAY_DING") {
    playDingSound();
  }
});
