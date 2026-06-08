"use client"

import { useState } from "react"
import { MuseumScene } from "./museum-scene"
import { IntroSequence } from "./ui/intro-sequence"
import { ExhibitViewer } from "./ui/exhibit-viewer"
import { TopBar, NavBar, RoomIntro } from "./ui/hud"
import { MapOverlay } from "./ui/map-overlay"
import { KeyboardControls } from "./ui/keyboard-controls"
import { FinalLetterOverlay } from "./ui/final-letter"
import { AnimatePresence } from "framer-motion"

/**
 * Root of the "Museum of Our Future" experience. Composes the persistent 3D
 * scene with the layered 2D overlay UI (intro, HUD, viewer, map).
 */
export function MuseumExperience() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <MuseumScene />

      {/* overlay UI */}
      <RoomIntro />
      <TopBar />
      <NavBar />
      <ExhibitViewer />
      <MapOverlay />
      <IntroSequence />
      
      <AnimatePresence>
        <FinalLetterOverlay />
      </AnimatePresence>

      {/* global controls */}
      <KeyboardControls />
    </main>
  )
}
