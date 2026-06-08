"use client"

import { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html, Text, Line } from "@react-three/drei"
import * as THREE from "three"
import { getExhibitsForRoom } from "@/lib/museum/content"
import { LIGHTING_PRESETS } from "@/lib/museum/lighting"
import { Floor } from "../three/scene-kit"
import { useMuseum } from "@/lib/museum/store"
import { audioEngine } from "@/lib/museum/audio"
import type { Exhibit } from "@/lib/museum/types"

/**
 * Hall of Possibilities — the observatory's exhibits reframed as a single
 * constellation. Stars are linked by glowing paths; inspecting one reveals
 * a possible future. Connecting lines animate a flowing pulse.
 */
export function ConstellationRoom() {
  const exhibits = getExhibitsForRoom("constellation")
  const accent = LIGHTING_PRESETS.constellation.accent

  const nodes = useMemo(() => {
    // Arrange in a deliberate constellation pattern.
    const pattern: [number, number, number][] = [
      [-5, 3.2, -7],
      [-2.2, 4.4, -8],
      [1.2, 3.0, -7.5],
      [4.4, 4.2, -8],
      [2.0, 1.4, -6.5],
      [-3.2, 1.2, -6.5],
    ]
    return exhibits.map((ex, i) => ({ ex, pos: pattern[i % pattern.length] }))
  }, [exhibits])

  const links = useMemo(() => {
    const pairs: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
      [0, 5],
      [4, 5],
    ]
    return pairs.map(([a, b]) => [nodes[a]?.pos, nodes[b]?.pos]).filter(Boolean) as [
      [number, number, number],
      [number, number, number],
    ][]
  }, [nodes])

  return (
    <group>
      <Floor color="#07060d" reflective />

      <Text
        position={[0, 6.4, -9]}
        fontSize={0.32}
        color={accent}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.2}
      >
        HALL 06 · HALL OF POSSIBILITIES
      </Text>
      <Text
        position={[0, 5.7, -9]}
        fontSize={0.5}
        color="#f1eefb"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
      >
        An Unwritten Future
      </Text>

      {links.map((pts, i) => (
        <ConstellationLink key={i} from={pts[0]} to={pts[1]} accent={accent} seed={i} />
      ))}

      {nodes.map(({ ex, pos }, i) => (
        <ConstellationStar key={ex.id} exhibit={ex} position={pos} accent={accent} seed={i} />
      ))}

      <fog attach="fog" args={["#07060d", 10, 32]} />
      <pointLight position={[0, 4, 2]} color={accent} intensity={1.2} distance={24} />
    </group>
  )
}

function ConstellationLink({
  from,
  to,
  accent,
  seed,
}: {
  from: [number, number, number]
  to: [number, number, number]
  accent: string
  seed: number
}) {
  const line = useRef<any>(null)
  useFrame((state) => {
    if (line.current?.material) {
      line.current.material.opacity =
        0.15 + Math.abs(Math.sin(state.clock.elapsedTime * 0.6 + seed)) * 0.3
    }
  })
  return <Line ref={line} points={[from, to]} color={accent} lineWidth={1} transparent opacity={0.2} />

}

function ConstellationStar({
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
      group.current.position.y = position[1] + Math.sin(t * 0.5 + seed) * 0.15
    }
    if (core.current) {
      const s = hovered ? 1.5 : 1
      core.current.scale.lerp(new THREE.Vector3(s, s, s), 0.12)
      const m = core.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 1 + Math.sin(t * 2 + seed) * 0.3 + (hovered ? 1.5 : 0)
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
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={1.2} />
      </mesh>
      <mesh scale={hovered ? 2.4 : 1.8}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={accent} transparent opacity={hovered ? 0.22 : 0.1} />
      </mesh>
      <pointLight color={accent} intensity={hovered ? 2 : 0.7} distance={4} />
      {viewed && (
        <mesh position={[0.32, 0.32, 0]}>
          <circleGeometry args={[0.04, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
      <Html center distanceFactor={11} position={[0, -0.6, 0]} zIndexRange={[15, 0]}>
        <div
          className="pointer-events-none select-none whitespace-nowrap text-center transition-opacity duration-300"
          style={{ opacity: hovered ? 1 : 0.0 }}
        >
          <div className="text-[12px] font-medium text-white">{exhibit.title}</div>
        </div>
      </Html>
    </group>
  )
}
