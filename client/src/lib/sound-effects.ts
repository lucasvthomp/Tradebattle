export type TradebattleSound = "tap" | "confirm" | "back" | "error";

let audioContext: AudioContext | null = null;

function isMuted() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem("tradebattle-sound") === "muted"
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

function tone(context: AudioContext, frequency: number, duration: number, start: number, volume: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export const soundEffects = {
  play(sound: TradebattleSound = "tap") {
    if (isMuted()) return;
    const context = getAudioContext();
    if (!context) return;
    void context.resume();

    const start = context.currentTime + 0.002;
    if (sound === "confirm") {
      tone(context, 540, 0.07, start, 0.035);
      tone(context, 760, 0.1, start + 0.055, 0.03);
      return;
    }
    if (sound === "back") {
      tone(context, 430, 0.08, start, 0.025);
      tone(context, 320, 0.09, start + 0.045, 0.02);
      return;
    }
    if (sound === "error") {
      tone(context, 220, 0.12, start, 0.03);
      return;
    }
    tone(context, 560, 0.055, start, 0.022);
  },
  mute() {
    if (typeof window !== "undefined") window.localStorage.setItem("tradebattle-sound", "muted");
  },
  unmute() {
    if (typeof window !== "undefined") window.localStorage.removeItem("tradebattle-sound");
  },
};
