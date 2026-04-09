const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export function playMoveSound() {
  playTone(600, 0.08, 'sine', 0.25);
}

export function playCaptureSound() {
  playTone(400, 0.12, 'triangle', 0.3);
}

export function playIllegalMoveSound() {
  playTone(200, 0.15, 'square', 0.2);
  setTimeout(() => playTone(150, 0.2, 'square', 0.15), 100);
}

export function playCheckSound() {
  playTone(800, 0.1, 'sawtooth', 0.2);
  setTimeout(() => playTone(1000, 0.1, 'sawtooth', 0.15), 80);
}

export function playGameOverSound() {
  playTone(523, 0.15, 'sine', 0.25);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.25), 150);
  setTimeout(() => playTone(784, 0.3, 'sine', 0.25), 300);
}
