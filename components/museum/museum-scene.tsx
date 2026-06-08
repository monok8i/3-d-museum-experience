"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { AdaptiveDpr, BakeShadows } from "@react-three/drei"
import * as THREE from "three"
import { useMuseum, currentRoomId } from "@/lib/museum/store"
import { getRoom, ROOM_ORDER } from "@/lib/museum/content"
import { LIGHTING_PRESETS } from "@/lib/museum/lighting"
import { audioEngine } from "@/lib/museum/audio"
import { LightingRig } from "./three/scene-kit"
import { CameraController } from "./three/camera-controller"

import { LobbyRoom } from "./rooms/lobby-room"
import { GalleryHall } from "./rooms/gallery-hall"
import { LabRoom } from "./rooms/lab-room"
import { LostRoom } from "./rooms/lost-room"
import { FutureRoom } from "./rooms/future-room"
import { ObservatoryRoom } from "./rooms/observatory-room"
import { ConstellationRoom } from "./rooms/constellation-room"
import { FinalRoom } from "./rooms/final-room"

function ActiveRoom({ roomId }: { roomId: string }) {
  switch (roomId) {
    case "lobby":
      return <LobbyRoom />
    case "origins":
      return (
        <GalleryHall
          roomId="origins"
          signage="Hall 01 · Origins"
          title="The Beginning"
        />
      )
    case "lab":
      return <LabRoom />
    case "lost":
      return <LostRoom />
    case "future":
      return <FutureRoom />
    case "observatory":
      return <ObservatoryRoom />
    case "constellation":
      return <ConstellationRoom />
    case "final":
      return <FinalRoom />
    default:
      return <LobbyRoom />
  }
}

/** Smoothly fades scene background between rooms by lerping the clear color. */
function SceneEnvironment({ theme }: { theme: keyof typeof LIGHTING_PRESETS }) {
  const preset = LIGHTING_PRESETS[theme]
  return (
    <>
      <color attach="background" args={[preset.background]} />
      <fog attach="fog" args={[preset.fog.color, preset.fog.near, preset.fog.far]} />
      <LightingRig preset={preset} />
    </>
  )
}

export function MuseumScene() {
  const roomIndex = useMuseum((s) => s.roomIndex)
  const muted = useMuseum((s) => s.muted)
  const phase = useMuseum((s) => s.phase)
  const roomId = currentRoomId(roomIndex)
  const room = getRoom(roomId)
  const theme = room?.lightingTheme ?? "lobby"

  // crossfade overlay between rooms
  const [transitioning, setTransitioning] = useState(false)
  const prevIndex = useRef(roomIndex)

  useEffect(() => {
    if (prevIndex.current !== roomIndex) {
      prevIndex.current = roomIndex
      setTransitioning(true)
      const t = setTimeout(() => setTransitioning(false), 650)
      return () => clearTimeout(t)
    }
  }, [roomIndex])

  // sync ambient audio to the active room
  useEffect(() => {
    if (phase === "intro") return
    audioEngine.transitionTo(theme)
  }, [theme, phase])

  useEffect(() => {
    audioEngine.setMuted(muted)
  }, [muted])

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 2.6, 8], fov: 55, near: 0.1, far: 200 }}
      >
        <SceneEnvironment theme={theme} />
        <CameraController />
        <Suspense fallback={null}>
          <ActiveRoom key={roomId} roomId={roomId} />
        </Suspense>
        <AdaptiveDpr pixelated />
        <BakeShadows />
      </Canvas>

      {/* room crossfade veil */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-500"
        style={{
          opacity: transitioning ? 1 : 0,
          background: LIGHTING_PRESETS[theme].background,
        }}
        aria-hidden
      />
      {/* cinematic vignette */}
      <div className="vignette pointer-events-none absolute inset-0 z-10" aria-hidden />
    </div>
  )
}

export { ROOM_ORDER }
