let ctx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    ctx = new Ctor();
  }
  return ctx;
}

export async function unlockAudio(): Promise<void> {
  const c = getAudioContext();
  if (c.state === "suspended") await c.resume();
}

export function beepOnce(freq = 800) {
  const c = getAudioContext();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(1, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.5);
}
