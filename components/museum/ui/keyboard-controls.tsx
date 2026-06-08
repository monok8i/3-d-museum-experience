"use client"

import { useEffect } from "react"
import { useMuseum } from "@/lib/museum/store"
import { audioEngine } from "@/lib/museum/audio"

/**
 * Global keyboard controls for the museum:
 * - Arrow Left / Right: previous / next hall
 * - M: toggle map
 * - Escape: close map
 * Disabled while an exhibit viewer is open (handled in viewer) or pre-intro.
 */
export function KeyboardControls() {
  const introComplete = useMuseum((s) => s.introComplete)
  const nextRoom = useMuseum((s) => s.nextRoom)
  const prevRoom = useMuseum((s) => s.prevRoom)
  const toggleMap = useMuseum((s) => s.toggleMap)
  const setMapOpen = useMuseum((s) => s.setMapOpen)
  const activeExhibit = useMuseum((s) => s.activeExhibit)
  const mapOpen = useMuseum((s) => s.mapOpen)

  useEffect(() => {
    if (!introComplete) return
    const onKey = (e: KeyboardEvent) => {
      if (activeExhibit) return
      if (e.key === "Escape" && mapOpen) {
        setMapOpen(false)
        return
      }
      if (mapOpen) return
      if (e.key === "ArrowRight") {
        audioEngine.cue("open")
        nextRoom()
      } else if (e.key === "ArrowLeft") {
        audioEngine.cue("close")
        prevRoom()
      } else if (e.key.toLowerCase() === "m") {
        toggleMap()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [introComplete, nextRoom, prevRoom, toggleMap, setMapOpen, activeExhibit, mapOpen])

  return null
}
