"use client"

import { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html, Text, Stars } from "@react-three/drei"
import * as THREE from "three"
import { getExhibitsForRoom } from "@/lib/museum/content"
import { LIGHTING_PRESETS } from "@/lib/museum/lighting"
import { Floor } from "../three/scene-kit"
import { useMuseum } from "@/lib/museum/store"
import { audioEngine } from "@/lib/museum/audio"
import type { Exhibit } from "@/lib/museum/types"

/**
 * Timeline Observatory — a near-infinite field of glowing "possible memories".
 * Each is a floating, clickable orb. Drifting starfield, deep space feel.
 */
export function ObservatoryRoom() {
  const exhibits = getExhibitsForRoom("observatory")
  const accent = LIGHTING_PRESETS.observatory.accent

  // Distribute exhibits in a loose spherical shell in front of the camera.
  const placements = useMemo(() => {
    return exhibits.map((ex, i) => {
      const angle = (i / exhibits.length) * Math.PI * 2
      const radius = 5 + (i % 3) * 1.6
      return {
        ex,
        pos: [
          Math.cos(angle) * radius,
          1.5 + Math.sin(i * 1.7) * 2.2,
          -6 - Math.sin(angle) * radius * 0.5,
        ] as [number, number, number],
      }
    })
  }, [exhibits])

  return (
    <group>
      <Floor color="#06070d" reflective={false} />
      <Stars radius={60} depth={40} count={3000} factor={3} saturation={0} fade speed={0.6} />

      <Text
        position={[0, 6.2, -9]}
        fontSize={0.34}
        color={accent}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.2}
      >
        HALL 05 · TIMELINE OBSERVATORY
      </Text>
      <Text
        position={[0, 5.4, -9]}
        fontSize={0.5}
        color="#eef2f8"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
      >
        A Field of Possible Futures
      </Text>

      {placements.map(({ ex, pos }, i) => (
        <PossibleMemory key={ex.id} exhibit={ex} position={pos} accent={accent} seed={i} />
      ))}

      <fog attach="fog" args={["#06070d", 8, 30]} />
      <pointLight position={[0, 4, 0]} color={accent} intensity={1.5} distance={25} />
    </group>
  )
}

function PossibleMemory({
  exhibit,
  position,
  accent,
  seed,
}: {
  exhibit: Exhibit
  position: [number, number, number]
  accent: string
  seed: number
}) {
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const openExhibit = useMuseum((s) => s.openExhibit)
  const viewed = useMuseum((s) => s.viewedExhibits.has(exhibit.id))

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(t * 0.6 + seed) * 0.3
    }
    if (core.current) {
      core.current.rotation.y = t * 0.5
      const s = hovered ? 1.4 : 1
      core.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1)
    }
  })

  return (
    <group ref={group} position={position}>
      <mesh
        ref={core}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          document.body.style.cursor = "auto"
        }}
        onClick={(e) => {
          e.stopPropagation()
          audioEngine.cue("open")
          openExhibit(exhibit)
        }}
      >
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={hovered ? 2.2 : 1.1}
          roughness={0.2}
          metalness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* halo */}
      <mesh scale={hovered ? 1.6 : 1.3}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial color={accent} transparent opacity={hovered ? 0.18 : 0.08} />
      </mesh>
      <pointLight color={accent} intensity={hovered ? 2 : 0.6} distance={4} />
      {viewed && (
        <mesh position={[0.5, 0.5, 0]}>
          <circleGeometry args={[0.05, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
      <Html center distanceFactor={10} position={[0, -0.9, 0]} zIndexRange={[15, 0]}>
        <div
          className="pointer-events-none select-none whitespace-nowrap text-center transition-opacity duration-300"
          style={{ opacity: hovered ? 1 : 0.45 }}
        >
          <div className="font-mono text-[9px] uppercase tracking-wide-label" style={{ color: accent }}>
            {exhibit.artifactCode}
          </div>
          <div className="text-[12px] font-medium text-white">{exhibit.title}</div>
        </div>
      </Html>
    </group>
  )
}
