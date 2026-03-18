// 使用 Web Audio API 產生提示音（不需要額外音檔）
function playNotificationSound() {
  const ctx = new AudioContext();

  // 音符序列：兩個短音
  const notes = [659.25, 783.99]; // E5, G5
  const duration = 0.15;
  const gap = 0.08;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, ctx.currentTime + i * (duration + gap));
    gain.gain.linearRampToValueAtTime(
      0.3,
      ctx.currentTime + i * (duration + gap) + 0.02
    );
    gain.gain.linearRampToValueAtTime(
      0,
      ctx.currentTime + i * (duration + gap) + duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + i * (duration + gap));
    osc.stop(ctx.currentTime + i * (duration + gap) + duration);
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "PLAY_SOUND") {
    playNotificationSound();
  }
});
