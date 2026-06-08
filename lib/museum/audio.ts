import type { LightingTheme } from "./types"

/**
 * Procedural ambient audio engine.
 *
 * Rather than shipping large audio files, each room's atmosphere is synthesized
 * with the Web Audio API: layered drones, slow filters, and sparse texture.
 * The architecture also supports future file-based audio — see `playFile`.
 */

type RoomAtmosphere = {
  /** Base drone frequencies (Hz). */
  drones: number[]
  /** Lowpass cutoff (Hz) — lower = warmer/darker. */
  cutoff: number
  /** Master gain for the room (0–1). */
  gain: number
  /** Subtle detune amount for shimmer. */
  detune?: number
}

const ATMOSPHERES: Record<LightingTheme, RoomAtmosphere> = {
  lobby: { drones: [55, 82.5, 110], cutoff: 700, gain: 0.16 },
  origins: { drones: [65.4, 98, 130.8], cutoff: 900, gain: 0.18, detune: 4 },
  lab: { drones: [73.4, 110, 220, 329.6], cutoff: 1400, gain: 0.14, detune: 8 },
  lost: { drones: [49, 73.4], cutoff: 420, gain: 0.09 },
  future: { drones: [87.3, 130.8, 174.6, 261.6], cutoff: 1700, gain: 0.15, detune: 6 },
  observatory: { drones: [61.7, 92.5, 123.5, 185], cutoff: 1200, gain: 0.13, detune: 10 },
  constellation: { drones: [82.4, 123.5, 164.8, 246.9], cutoff: 1500, gain: 0.13, detune: 12 },
  final: { drones: [55, 110], cutoff: 600, gain: 0.12 },
}

class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private voices: { osc: OscillatorNode; gain: GainNode }[] = []
  private filter: BiquadFilterNode | null = null
  private current: LightingTheme | null = null
  private muted = false

  private ensure() {
    if (typeof window === "undefined") return null
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.muted ? 0 : 1
      this.filter = this.ctx.createBiquadFilter()
      this.filter.type = "lowpass"
      this.filter.frequency.value = 800
      this.filter.connect(this.master)
      this.master.connect(this.ctx.destination)
    }
    return this.ctx
  }

  async resume() {
    const ctx = this.ensure()
    if (ctx && ctx.state === "suspended") {
      try {
        await ctx.resume()
      } catch {
        /* ignore */
      }
    }
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.master && this.ctx) {
      const now = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.linearRampToValueAtTime(m ? 0 : 1, now + 0.6)
    }
  }

  /** Crossfade the ambient bed to a new room atmosphere. */
  transitionTo(theme: LightingTheme) {
    const ctx = this.ensure()
    if (!ctx || !this.filter) return
    if (this.current === theme && this.voices.length) return
    this.current = theme
    const atmo = ATMOSPHERES[theme]
    const now = ctx.currentTime

    // Fade out & schedule cleanup of existing voices.
    const old = this.voices
    this.voices = []
    old.forEach(({ osc, gain }) => {
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(gain.gain.value, now)
      gain.gain.linearRampToValueAtTime(0.0001, now + 1.6)
      osc.stop(now + 1.8)
    })

    // Ramp filter cutoff toward the new room's tone.
    this.filter.frequency.cancelScheduledValues(now)
    this.filter.frequency.setValueAtTime(this.filter.frequency.value, now)
    this.filter.frequency.linearRampToValueAtTime(atmo.cutoff, now + 2)

    // Spin up new drone voices.
    atmo.drones.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = i % 2 === 0 ? "sine" : "triangle"
      osc.frequency.value = freq
      if (atmo.detune) osc.detune.value = (i - atmo.drones.length / 2) * atmo.detune
      gain.gain.value = 0.0001
      osc.connect(gain)
      gain.connect(this.filter!)
      osc.start(now)
      const target = (atmo.gain / atmo.drones.length) * (1 - i * 0.12)
      gain.gain.linearRampToValueAtTime(Math.max(0.01, target), now + 2.4)
      // Slow LFO-like shimmer via scheduled drift.
      this.scheduleDrift(gain, target, now)
      this.voices.push({ osc, gain })
    })
  }

  private scheduleDrift(gain: GainNode, base: number, start: number) {
    if (!this.ctx) return
    // Gentle amplitude breathing using ramps.
    const cycle = 6 + Math.random() * 6
    for (let t = 0; t < 60; t += cycle) {
      const at = start + t
      gain.gain.linearRampToValueAtTime(base * 0.7, at + cycle / 2)
      gain.gain.linearRampToValueAtTime(base, at + cycle)
    }
  }

  /** Short UI cue (e.g. opening an exhibit). */
  cue(kind: "open" | "close" | "step" = "open") {
    const ctx = this.ensure()
    if (!ctx || !this.master || this.muted) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    const base = kind === "open" ? 523.25 : kind === "close" ? 392 : 659.25
    osc.frequency.setValueAtTime(base, now)
    osc.frequency.exponentialRampToValueAtTime(base * (kind === "close" ? 0.6 : 1.5), now + 0.25)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)
    osc.connect(gain)
    gain.connect(this.master)
    osc.start(now)
    osc.stop(now + 0.55)
  }

  /** Future: play an uploaded audio file mapped to a room. */
  playFile(_src: string) {
    // Reserved for future asset-based audio.
  }
}

export const audioEngine = new AudioEngine()
