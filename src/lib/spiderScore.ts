"use client";

// A tiny procedural score for the letter pages — no audio file to ship,
// just a Web Audio graph: a slow, dark drone plus sparse plucked notes on
// a phrygian scale, evoking an old, mythic "something is watching from
// the web" mood rather than a literal song. Starts only from a user
// gesture (the envelope tap) since browsers block audio before that
// anyway.

const PHRYGIAN_STEPS = [0, 1, 3, 5, 7, 8, 10]; // A phrygian
const ROOT = 220; // A3

function noteFreq(semitoneOffset: number): number {
  return ROOT * Math.pow(2, semitoneOffset / 12);
}

type AudioContextCtor = typeof AudioContext;

export class SpiderScore {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private nodes: AudioScheduledSourceNode[] = [];
  private pluckTimer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private muted = false;

  start() {
    if (this.running) return;
    const Ctor: AudioContextCtor | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
    if (!Ctor) return;

    this.running = true;
    const ctx = new Ctor();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(this.muted ? 0 : 0.45, ctx.currentTime + 2.5);
    this.master = master;

    this.startDrone(ctx, master);
    this.scheduleNextPluck(ctx, master);
  }

  private startDrone(ctx: AudioContext, master: GainNode) {
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.35;
    droneGain.connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 380;
    filter.Q.value = 0.6;
    filter.connect(droneGain);

    // slow filter sweep — the drone "breathes"
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 170;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    this.nodes.push(lfo);

    const freqs = [noteFreq(-12), noteFreq(-5), noteFreq(0)];
    for (const f of freqs) {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = f;
      osc.detune.value = (Math.random() - 0.5) * 8;
      osc.connect(filter);
      osc.start();
      this.nodes.push(osc);
    }

    // slow tremolo so it never sits perfectly still
    const tremolo = ctx.createOscillator();
    tremolo.frequency.value = 0.085;
    const tremoloGain = ctx.createGain();
    tremoloGain.gain.value = 0.1;
    tremolo.connect(tremoloGain);
    tremoloGain.connect(droneGain.gain);
    tremolo.start();
    this.nodes.push(tremolo);
  }

  private scheduleNextPluck(ctx: AudioContext, master: GainNode) {
    const delay = 1900 + Math.random() * 2600;
    this.pluckTimer = setTimeout(() => {
      if (!this.running) return;
      this.pluck(ctx, master);
      this.scheduleNextPluck(ctx, master);
    }, delay);
  }

  private pluck(ctx: AudioContext, master: GainNode) {
    const step = PHRYGIAN_STEPS[Math.floor(Math.random() * PHRYGIAN_STEPS.length)];
    const octave = Math.random() < 0.5 ? 12 : 24;
    const freq = noteFreq(step + octave);
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    let output: AudioNode = gain;
    if (typeof ctx.createStereoPanner === "function") {
      const panner = ctx.createStereoPanner();
      panner.pan.value = (Math.random() - 0.5) * 1.2;
      gain.connect(panner);
      output = panner;
    }

    osc.connect(gain);
    output.connect(master);
    osc.start(now);
    osc.stop(now + 2.3);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(muted ? 0 : 0.45, this.ctx.currentTime + 0.4);
    }
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.pluckTimer) clearTimeout(this.pluckTimer);
    const ctx = this.ctx;
    const master = this.master;
    const nodes = this.nodes;
    if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(() => {
        nodes.forEach((n) => {
          try {
            n.stop();
          } catch {
            // already stopped
          }
        });
        ctx.close().catch(() => {});
      }, 600);
    }
    this.nodes = [];
    this.ctx = null;
    this.master = null;
  }
}
