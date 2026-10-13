/**
 * A tiny, dependency-free ambient score + sound effects built with the Web Audio API.
 * Nothing is fetched from the network; if AudioContext is unavailable the whole
 * experience simply runs silently.
 */

type Sfx = "sparkle" | "paper" | "snuff" | "seal" | "star" | "chime";

type Listener = (s: { supported: boolean; running: boolean }) => void;

const VOICES = 4;

/** Am7 → Fmaj7 → G6 → Em7, gentle and unresolved. */
const PROGRESSION: number[][] = [
  [220.0, 261.63, 329.63, 196.0],
  [174.61, 261.63, 329.63, 220.0],
  [196.0, 246.94, 293.66, 164.81],
  [164.81, 246.94, 329.63, 196.0],
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private oscs: OscillatorNode[] = [];
  private timer: number | null = null;
  private step = 0;
  private listeners = new Set<Listener>();
  private state = { supported: false, running: false };
  private pending = false;
  private muted = false;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    this.listeners.forEach((l) => l(this.state));
  }

  private ensure() {
    if (this.ctx) return this.ctx;
    try {
      const Ctor: typeof AudioContext =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
      this.state = { supported: true, running: false };
      this.emit();
    } catch {
      this.ctx = null;
      this.state = { supported: false, running: false };
      this.emit();
      return null;
    }
    return this.ctx;
  }

  private buildPad() {
    const ctx = this.ctx;
    if (!ctx || this.oscs.length) return;

    this.padGain = ctx.createGain();
    this.padGain.gain.value = 0.5;

    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 900;
    this.filter.Q.value = 0.6;

    // slow breathing on the filter cutoff
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoAmt = ctx.createGain();
    lfoAmt.gain.value = 260;
    lfo.connect(lfoAmt).connect(this.filter.frequency);
    lfo.start();

    this.padGain.connect(this.filter).connect(this.master!);

    const chord = PROGRESSION[0];
    for (let i = 0; i < VOICES; i++) {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = chord[i];
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.16 : 0.075;
      osc.connect(g).connect(this.padGain!);
      osc.start();
      this.oscs.push(osc);
    }
  }

  async start() {
    const ctx = this.ensure();
    if (!ctx || this.pending) return;
    this.pending = true;
    try {
      if (ctx.state === "suspended") await ctx.resume();
      this.buildPad();
      const now = ctx.currentTime;
      this.master!.gain.cancelScheduledValues(now);
      this.master!.gain.setValueAtTime(this.master!.gain.value, now);
      this.master!.gain.linearRampToValueAtTime(0.5, now + 2.4);
      if (this.timer === null) {
        this.timer = window.setInterval(() => this.nextChord(), 7600);
      }
      this.state = { supported: true, running: true };
      this.emit();
    } catch {
      this.state = { supported: false, running: false };
      this.emit();
    } finally {
      this.pending = false;
    }
  }

  private nextChord() {
    const ctx = this.ctx;
    if (!ctx || !this.oscs.length) return;
    this.step = (this.step + 1) % PROGRESSION.length;
    const chord = PROGRESSION[this.step];
    const now = ctx.currentTime;
    this.oscs.forEach((o, i) => {
      o.frequency.cancelScheduledValues(now);
      o.frequency.setValueAtTime(o.frequency.value, now);
      o.frequency.exponentialRampToValueAtTime(Math.max(40, chord[i]), now + 3.4);
    });
  }

  stop() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.7);
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.state = { supported: true, running: false };
    this.emit();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(muted ? 0 : 0.5, now + 0.35);
  }

  sfx(kind: Sfx) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    const g = ctx.createGain();
    g.connect(this.master);

    const config: Record<Sfx, { freq: number; dur: number; type: OscillatorType; peak: number; slide?: number }> = {
      sparkle: { freq: 1560, dur: 0.7, type: "sine", peak: 0.1, slide: 2600 },
      star: { freq: 2100, dur: 0.9, type: "sine", peak: 0.12, slide: 3200 },
      chime: { freq: 880, dur: 1.8, type: "sine", peak: 0.13, slide: 1320 },
      seal: { freq: 320, dur: 0.35, type: "triangle", peak: 0.14, slide: 180 },
      paper: { freq: 640, dur: 0.4, type: "triangle", peak: 0.06, slide: 380 },
      snuff: { freq: 180, dur: 0.6, type: "sine", peak: 0.09, slide: 70 },
    };
    const c = config[kind];

    const osc = ctx.createOscillator();
    osc.type = c.type;
    osc.frequency.setValueAtTime(c.freq, now);
    if (c.slide) osc.frequency.exponentialRampToValueAtTime(c.slide, now + c.dur);
    osc.connect(g);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(c.peak, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, now + c.dur);
    osc.start(now);
    osc.stop(now + c.dur + 0.05);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  get supported() {
    return this.state.supported;
  }

  get running() {
    return this.state.running;
  }
}

export const audio = new AudioEngine();
