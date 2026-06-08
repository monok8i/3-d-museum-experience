import type { LightingTheme } from "./types"

/**
 * Reusable lighting presets per room theme. Each 3D room reads its preset and
 * configures ambient, key, fill, and accent lights plus fog. Add presets here
 * to introduce new atmospheres without touching scene components.
 */

export type LightSpec = {
  position: [number, number, number]
  intensity: number
  color: string
  distance?: number
  angle?: number
  penumbra?: number
}

export type LightingPreset = {
  background: string
  fog: { color: string; near: number; far: number }
  ambient: { intensity: number; color: string }
  hemisphere?: { sky: string; ground: string; intensity: number }
  spots: LightSpec[]
  points: LightSpec[]
  /** Accent color used for glow/edge highlights in the room. */
  accent: string
}

export const LIGHTING_PRESETS: Record<LightingTheme, LightingPreset> = {
  lobby: {
    background: "#14171c",
    fog: { color: "#14171c", near: 8, far: 38 },
    ambient: { intensity: 0.35, color: "#cdd6e0" },
    hemisphere: { sky: "#aebccb", ground: "#1a1d22", intensity: 0.4 },
    spots: [
      { position: [0, 11, 2], intensity: 2.6, color: "#f3f0e7", angle: 0.7, penumbra: 0.9, distance: 40 },
      { position: [0, 7, -10], intensity: 1.8, color: "#bcd0e6", angle: 0.8, penumbra: 1, distance: 36 },
    ],
    points: [{ position: [0, 3, 6], intensity: 8, color: "#9fd8e6", distance: 20 }],
    accent: "#9fd8e6",
  },
  origins: {
    background: "#171310",
    fog: { color: "#171310", near: 6, far: 30 },
    ambient: { intensity: 0.3, color: "#e8d9c2" },
    spots: [
      { position: [-6, 8, -2], intensity: 3, color: "#ffcf96", angle: 0.5, penumbra: 0.8, distance: 30 },
      { position: [0, 8, -2], intensity: 3, color: "#ffd9a8", angle: 0.5, penumbra: 0.8, distance: 30 },
      { position: [6, 8, -2], intensity: 3, color: "#ffcf96", angle: 0.5, penumbra: 0.8, distance: 30 },
    ],
    points: [{ position: [0, 4, 4], intensity: 6, color: "#ffb877", distance: 18 }],
    accent: "#ffb877",
  },
  lab: {
    background: "#0c1116",
    fog: { color: "#0c1116", near: 5, far: 34 },
    ambient: { intensity: 0.25, color: "#bcd6e6" },
    spots: [
      { position: [0, 10, 0], intensity: 2.4, color: "#bfe8ff", angle: 0.9, penumbra: 1, distance: 40 },
    ],
    points: [
      { position: [0, 3, 0], intensity: 14, color: "#5fd4ff", distance: 22 },
      { position: [-7, 4, -6], intensity: 5, color: "#3a9fd0", distance: 18 },
      { position: [7, 4, -6], intensity: 5, color: "#3a9fd0", distance: 18 },
    ],
    accent: "#5fd4ff",
  },
  lost: {
    background: "#0a0b0d",
    fog: { color: "#0a0b0d", near: 4, far: 24 },
    ambient: { intensity: 0.14, color: "#9aa3ad" },
    spots: [
      { position: [-5, 7, -4], intensity: 1.4, color: "#cfd6dd", angle: 0.35, penumbra: 1, distance: 24 },
      { position: [0, 7, -5], intensity: 1.4, color: "#cfd6dd", angle: 0.35, penumbra: 1, distance: 24 },
      { position: [5, 7, -4], intensity: 1.4, color: "#cfd6dd", angle: 0.35, penumbra: 1, distance: 24 },
    ],
    points: [],
    accent: "#aab4be",
  },
  future: {
    background: "#0b0f18",
    fog: { color: "#0b0f18", near: 6, far: 36 },
    ambient: { intensity: 0.26, color: "#aebfe8" },
    spots: [
      { position: [-6, 9, -2], intensity: 2.6, color: "#9db4ff", angle: 0.5, penumbra: 0.9, distance: 32 },
      { position: [0, 9, -2], intensity: 2.6, color: "#b8c6ff", angle: 0.5, penumbra: 0.9, distance: 32 },
      { position: [6, 9, -2], intensity: 2.6, color: "#9db4ff", angle: 0.5, penumbra: 0.9, distance: 32 },
    ],
    points: [{ position: [0, 4, 5], intensity: 7, color: "#7c97ff", distance: 20 }],
    accent: "#8aa0ff",
  },
  observatory: {
    background: "#05060a",
    fog: { color: "#05060a", near: 8, far: 60 },
    ambient: { intensity: 0.18, color: "#8aa0c0" },
    spots: [],
    points: [{ position: [0, 5, 0], intensity: 6, color: "#9fd8ff", distance: 30 }],
    accent: "#9fd8ff",
  },
  constellation: {
    background: "#04050a",
    fog: { color: "#04050a", near: 10, far: 80 },
    ambient: { intensity: 0.16, color: "#9ab0d8" },
    spots: [],
    points: [{ position: [0, 6, 0], intensity: 5, color: "#bcd0ff", distance: 40 }],
    accent: "#bcd0ff",
  },
  final: {
    background: "#e9eaec",
    fog: { color: "#e9eaec", near: 10, far: 50 },
    ambient: { intensity: 0.9, color: "#ffffff" },
    spots: [
      { position: [0, 12, 6], intensity: 2, color: "#ffffff", angle: 0.9, penumbra: 1, distance: 50 },
    ],
    points: [],
    accent: "#7c97ff",
  },
}
