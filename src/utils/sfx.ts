let ctx: AudioContext | null = null;

function getCtx() {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return ctx;
}

export function playPaperOpenSfx() {
  const c = getCtx();
  if (c.state === "suspended") {
    c.resume().catch(() => {
      return;
    });
  }

  const now = c.currentTime;

  const bufferSize = Math.floor(c.sampleRate * 0.12);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    const t = i / bufferSize;
    const env = (1 - t) * (1 - t);
    data[i] = (Math.random() * 2 - 1) * env;
  }

  const src = c.createBufferSource();
  src.buffer = buffer;

  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.setValueAtTime(700, now);

  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(1600, now);
  bp.Q.setValueAtTime(0.6, now);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.35, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  src.connect(hp);
  hp.connect(bp);
  bp.connect(gain);
  gain.connect(c.destination);

  src.start(now);
  src.stop(now + 0.12);

  const click = c.createOscillator();
  click.type = "triangle";
  click.frequency.setValueAtTime(260, now);
  click.frequency.exponentialRampToValueAtTime(120, now + 0.08);

  const clickGain = c.createGain();
  clickGain.gain.setValueAtTime(0.0001, now);
  clickGain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  click.connect(clickGain);
  clickGain.connect(c.destination);
  click.start(now);
  click.stop(now + 0.09);
}

export function playClawDropSfx() {
  const c = getCtx();
  if (c.state === "suspended") {
    c.resume().catch(() => {
      return;
    });
  }

  const now = c.currentTime;

  const osc = c.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(800, now);

  osc.connect(lp);
  lp.connect(gain);
  gain.connect(c.destination);

  osc.start(now);
  osc.stop(now + 0.16);
}

export function playClawWinSfx() {
  const c = getCtx();
  if (c.state === "suspended") {
    c.resume().catch(() => {
      return;
    });
  }

  const now = c.currentTime;

  const o1 = c.createOscillator();
  o1.type = "sine";
  o1.frequency.setValueAtTime(440, now);

  const o2 = c.createOscillator();
  o2.type = "triangle";
  o2.frequency.setValueAtTime(660, now + 0.03);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.10, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.setValueAtTime(260, now);

  o1.connect(hp);
  o2.connect(hp);
  hp.connect(gain);
  gain.connect(c.destination);

  o1.start(now);
  o2.start(now + 0.03);
  o1.stop(now + 0.45);
  o2.stop(now + 0.45);
}

export function playClawLoseSfx() {
  const c = getCtx();
  if (c.state === "suspended") {
    c.resume().catch(() => {
      return;
    });
  }

  const now = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.30);

  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.32);
}
