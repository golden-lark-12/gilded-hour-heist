// Procedural Web Audio. One job: every sound the game makes, synthesised
// locally with no audio files and no network, guarded so a missing or
// blocked AudioContext can never break the game.

export function createAudio() {
  const audio = {
    context: null,
    muted: false,
    alarmNodes: null,
    unlocked: false,
  };
  audio.unlock = () => {
    if (audio.unlocked) return;
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      audio.context = new Ctor();
      audio.unlocked = true;
    } catch (error) {
      audio.context = null;
    }
  };
  audio.tone = (frequency, seconds, type, gainValue, when) => {
    if (audio.muted || !audio.context) return;
    try {
      if (audio.context.state === 'suspended') audio.context.resume();
      const start = audio.context.currentTime + (when || 0);
      const oscillator = audio.context.createOscillator();
      const gain = audio.context.createGain();
      oscillator.type = type || 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(gainValue || 0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
      oscillator.connect(gain);
      gain.connect(audio.context.destination);
      oscillator.start(start);
      oscillator.stop(start + seconds + 0.02);
    } catch (error) {
      // Sound is garnish: never let it throw into the game loop.
    }
  };
  audio.pickup = () => {
    audio.tone(660, 0.12, 'sine', 0.09, 0);
    audio.tone(880, 0.16, 'sine', 0.09, 0.09);
    audio.tone(1320, 0.22, 'sine', 0.07, 0.18);
  };
  audio.hackTick = () => audio.tone(1200, 0.05, 'square', 0.03, 0);
  audio.crackGood = () => {
    audio.tone(520, 0.1, 'triangle', 0.09, 0);
    audio.tone(780, 0.14, 'triangle', 0.09, 0.08);
  };
  audio.crackBad = () => audio.tone(160, 0.18, 'sawtooth', 0.07, 0);
  audio.spotted = () => audio.tone(440, 0.14, 'square', 0.06, 0);
  audio.laserZap = () => audio.tone(220, 0.2, 'sawtooth', 0.08, 0);
  audio.win = () => {
    [523, 659, 784, 1046].forEach((freq, i) => audio.tone(freq, 0.24, 'triangle', 0.09, i * 0.13));
  };
  audio.caught = () => {
    [392, 330, 262, 196].forEach((freq, i) => audio.tone(freq, 0.22, 'triangle', 0.08, i * 0.12));
  };
  audio.toggleMute = () => {
    audio.muted = !audio.muted;
    return audio.muted;
  };
  return audio;
}
