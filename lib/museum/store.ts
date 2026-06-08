import { create } from "zustand"
import { ROOM_ORDER } from "./content"
import type { Exhibit } from "./types"

export type Phase = "intro" | "lobby" | "touring" | "ending"

type MuseumState = {
  phase: Phase
  /** Index into ROOM_ORDER for the active room. */
  roomIndex: number
  /** Currently opened exhibit in the detail viewer, or null. */
  activeExhibit: Exhibit | null
  visitedRooms: Set<string>
  viewedExhibits: Set<string>
  muted: boolean
  mapOpen: boolean
  introComplete: boolean
  showFinalLetter: boolean

  // actions
  setPhase: (phase: Phase) => void
  enterMuseum: () => void
  goToRoomIndex: (index: number) => void
  nextRoom: () => void
  prevRoom: () => void
  openExhibit: (exhibit: Exhibit) => void
  closeExhibit: () => void
  toggleMute: () => void
  setMuted: (m: boolean) => void
  toggleMap: () => void
  setMapOpen: (open: boolean) => void
  setShowFinalLetter: (show: boolean) => void
  reset: () => void
}

export const currentRoomId = (index: number) => ROOM_ORDER[index]

export const useMuseum = create<MuseumState>((set, get) => ({
  phase: "intro",
  roomIndex: 0,
  activeExhibit: null,
  visitedRooms: new Set<string>(),
  viewedExhibits: new Set<string>(),
  muted: false,
  mapOpen: false,
  introComplete: false,
  showFinalLetter: false,

  setPhase: (phase) => set({ phase }),

  enterMuseum: () =>
    set((s) => {
      const visited = new Set(s.visitedRooms)
      visited.add(ROOM_ORDER[0])
      return { phase: "lobby", introComplete: true, visitedRooms: visited }
    }),

  goToRoomIndex: (index) =>
    set((s) => {
      const clamped = Math.max(0, Math.min(index, ROOM_ORDER.length - 1))
      const visited = new Set(s.visitedRooms)
      visited.add(ROOM_ORDER[clamped])
      const isFinal = clamped === ROOM_ORDER.length - 1
      return {
        roomIndex: clamped,
        visitedRooms: visited,
        activeExhibit: null,
        mapOpen: false,
        phase: clamped === 0 ? "lobby" : isFinal ? "ending" : "touring",
      }
    }),

  nextRoom: () => get().goToRoomIndex(get().roomIndex + 1),
  prevRoom: () => get().goToRoomIndex(get().roomIndex - 1),

  openExhibit: (exhibit) =>
    set((s) => {
      const viewed = new Set(s.viewedExhibits)
      viewed.add(exhibit.id)
      return { activeExhibit: exhibit, viewedExhibits: viewed }
    }),

  closeExhibit: () => set({ activeExhibit: null }),

  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setMuted: (m) => set({ muted: m }),
  toggleMap: () => set((s) => ({ mapOpen: !s.mapOpen })),
  setMapOpen: (open) => set({ mapOpen: open }),
  setShowFinalLetter: (show) => set({ showFinalLetter: show }),

  reset: () =>
    set({
      phase: "intro",
      roomIndex: 0,
      activeExhibit: null,
      visitedRooms: new Set<string>(),
      viewedExhibits: new Set<string>(),
      mapOpen: false,
      introComplete: false,
      showFinalLetter: false,
    }),
}))
