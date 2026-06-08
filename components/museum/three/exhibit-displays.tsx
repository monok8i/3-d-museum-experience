"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html, useTexture, RoundedBox } from "@react-three/drei"
import * as THREE from "three"
import type { Exhibit } from "@/lib/museum/types"
import { STATUS_LABELS } from "@/lib/museum/types"
import { useMuseum } from "@/lib/museum/store"
import { audioEngine } from "@/lib/museum/audio"

function useExhibitInteraction(exhibit: Exhibit) {
  const [hovered, setHovered] = useState(false)
  const openExhibit = useMuseum((s) => s.openExhibit)
  const viewed = useMuseum((s) => s.viewedExhibits.has(exhibit.id))

  const bind = {
    onPointerOver: (e: any) => {
      e.stopPropagation()
      setHovered(true)
      document.body.style.cursor = "pointer"
    },
    onPointerOut: (e: any) => {
      e.stopPropagation()
      setHovered(false)
      document.body.style.cursor = "auto"
    },
    onClick: (e: any) => {
      e.stopPropagation()
      audioEngine.cue("open")
      openExhibit(exhibit)
    },
  }
  return { hovered, viewed, bind }
}

/** Floating plaque shown on hover (and a persistent small marker). */
function Plaque({
  exhibit,
  visible,
  accent,
}: {
  exhibit: Exhibit
  visible: boolean
  accent: string
}) {
  return (
    <Html center distanceFactor={9} position={[0, -1.5, 0.2]} zIndexRange={[20, 0]}>
      <div
        className="pointer-events-none select-none transition-all duration-300"
        style={{ opacity: visible ? 1 : 0.0, transform: `translateY(${visible ? 0 : 6}px)` }}
      >
        <div className="w-48 rounded-md border border-white/10 bg-black/70 px-3 py-2 backdrop-blur-md">
          <div
            className="font-mono text-[9px] uppercase tracking-wide-label"
            style={{ color: accent }}
          >
            {exhibit.artifactCode} · {exhibit.year}
          </div>
          <div className="mt-1 text-[13px] font-medium leading-tight text-white">
            {exhibit.title}
          </div>
          <div className="mt-0.5 text-[10px] text-white/55">
            {exhibit.status ? STATUS_LABELS[exhibit.status] : exhibit.category}
          </div>
        </div>
      </div>
    </Html>
  )
}

/** Framed photo/text artifact mounted on a wall. */
export function WallExhibit({
  exhibit,
  accent,
}: {
  exhibit: Exhibit
  accent: string
}) {
  const { hovered, viewed, bind } = useExhibitInteraction(exhibit)
  const group = useRef<THREE.Group>(null)
  const glow = useRef<THREE.PointLight>(null)
  const pos = exhibit.position ?? [0, 1.6, -7.4]

  useFrame((state) => {
    if (glow.current) {
      const target = hovered ? 4 : 1.2
      glow.current.intensity += (target - glow.current.intensity) * 0.1
      glow.current.intensity += Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })

  const hasImage = exhibit.media?.kind === "image" && exhibit.media.src

  return (
    <group ref={group} position={pos} {...bind}>
      {/* frame */}
      <RoundedBox args={[2.6, 3.2, 0.16]} radius={0.04} smoothness={4} castShadow>
        <meshStandardMaterial color="#0c0d10" roughness={0.6} metalness={0.4} />
      </RoundedBox>
      {/* matte */}
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[2.2, 2.8]} />
        <meshStandardMaterial color="#16181c" roughness={0.9} />
      </mesh>
      {/* image or text surface */}
      {hasImage ? (
        <FramedImage src={exhibit.media!.src!} hovered={hovered} />
      ) : (
        <TextArtifactSurface exhibit={exhibit} accent={accent} />
      )}
      {/* hover edge highlight */}
      <mesh position={[0, 0, 0.085]}>
        <ringGeometry args={[1.55, 1.62, 4, 1, Math.PI / 4]} />
        <meshBasicMaterial color={accent} transparent opacity={hovered ? 0.0 : 0.0} />
      </mesh>
      <pointLight ref={glow} position={[0, 0, 1.2]} color={accent} intensity={1.2} distance={5} />
      {/* visited marker */}
      {viewed && (
        <mesh position={[1.1, 1.4, 0.12]}>
          <circleGeometry args={[0.06, 16]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      )}
      <Plaque exhibit={exhibit} visible={hovered} accent={accent} />
    </group>
  )
}

function FramedImage({ src, hovered }: { src: string; hovered: boolean }) {
  const texture = useTexture(src)
  return (
    <mesh position={[0, 0.1, 0.1]} scale={hovered ? 1.02 : 1}>
      <planeGeometry args={[1.9, 2.4]} />
      <meshBasicMaterial map={texture as THREE.Texture} toneMapped={false} />
    </mesh>
  )
}

function TextArtifactSurface({ exhibit, accent }: { exhibit: Exhibit; accent: string }) {
  return (
    <Html
      transform
      position={[0, 0.1, 0.11]}
      distanceFactor={3.2}
      zIndexRange={[10, 0]}
      pointerEvents="none"
    >
      <div className="pointer-events-none w-[210px] select-none px-3 py-4 text-center">
        <div
          className="font-mono text-[7px] uppercase tracking-museum"
          style={{ color: accent }}
        >
          {exhibit.artifactCode}
        </div>
        <div className="mt-3 font-serif text-[13px] italic leading-snug text-white/85">
          {exhibit.plaque ?? exhibit.title}
        </div>
        <div className="mx-auto mt-4 h-px w-8" style={{ background: accent }} />
      </div>
    </Html>
  )
}

/**
 * A glass display case on a pedestal. Used in Lobby/Lost Artifacts. When the
 * exhibit is "invisible", the case is intentionally empty with a quiet plaque.
 */
export function PedestalCase({
  exhibit,
  accent,
  empty = false,
}: {
  exhibit: Exhibit
  accent: string
  empty?: boolean
}) {
  const { hovered, viewed, bind } = useExhibitInteraction(exhibit)
  const artifact = useRef<THREE.Mesh>(null)
  const pos = exhibit.position ?? [0, 0, -6]

  useFrame((state) => {
    if (artifact.current) {
      artifact.current.rotation.y = state.clock.elapsedTime * 0.4
      artifact.current.position.y =
        2.0 + Math.sin(state.clock.elapsedTime * 1.2) * 0.05
    }
  })

  return (
    <group position={[pos[0], 0, pos[2]]} {...bind}>
      {/* pedestal */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.65, 1.2, 32]} />
        <meshStandardMaterial color="#1c1f24" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.22, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.06, 32]} />
        <meshStandardMaterial color="#0d0e11" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* glass case */}
      <mesh position={[0, 2.0, 0]}>
        <boxGeometry args={[1.0, 1.5, 1.0]} />
        <meshPhysicalMaterial
          color="#cfe6f2"
          transmission={0.92}
          transparent
          opacity={0.18}
          roughness={0.08}
          metalness={0}
          thickness={0.5}
        />
      </mesh>
      {/* artifact inside (or empty) */}
      {!empty && (
        <mesh ref={artifact} position={[0, 2.0, 0]} castShadow>
          <icosahedronGeometry args={[0.28, 1]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={hovered ? 1.4 : 0.7}
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>
      )}
      {empty && (
        <pointLight position={[0, 2.0, 0]} color={accent} intensity={hovered ? 1.2 : 0.4} distance={3} />
      )}
      {viewed && (
        <mesh position={[0, 1.26, 0.5]}>
          <circleGeometry args={[0.04, 16]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      )}
      <Plaque exhibit={exhibit} visible={hovered} accent={accent} />
    </group>
  )
}
