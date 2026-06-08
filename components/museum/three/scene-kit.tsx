"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { LightingPreset } from "@/lib/museum/lighting"
import * as THREE from "three"

/**
 * Renders a complete lighting rig from a preset: ambient, hemisphere, spots,
 * and points. Used by every room so lighting stays data-driven.
 */
export function LightingRig({ preset }: { preset: LightingPreset }) {
  return (
    <>
      <ambientLight intensity={preset.ambient.intensity} color={preset.ambient.color} />
      {preset.hemisphere && (
        <hemisphereLight
          color={preset.hemisphere.sky}
          groundColor={preset.hemisphere.ground}
          intensity={preset.hemisphere.intensity}
        />
      )}
      {preset.spots.map((s, i) => (
        <spotLight
          key={`spot-${i}`}
          position={s.position}
          intensity={s.intensity}
          color={s.color}
          angle={s.angle ?? 0.6}
          penumbra={s.penumbra ?? 0.8}
          distance={s.distance}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
      ))}
      {preset.points.map((p, i) => (
        <pointLight
          key={`point-${i}`}
          position={p.position}
          intensity={p.intensity}
          color={p.color}
          distance={p.distance}
        />
      ))}
    </>
  )
}

/** A subtle floating dust/particle field shared across rooms. */
export function Motes({
  count = 140,
  color = "#9fd8e6",
  radius = 16,
  speed = 0.04,
}: {
  count?: number
  color?: string
  radius?: number
  speed?: number
}) {
  const ref = useRef<THREE.Points>(null)
  const positions = useRef<Float32Array | undefined>(undefined)

  if (!positions.current) {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * radius * 2
      arr[i * 3 + 1] = Math.random() * 8
      arr[i * 3 + 2] = (Math.random() - 0.5) * radius * 2
    }
    positions.current = arr
  }

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * speed
    const p = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const y = (positions.current as Float32Array)[i * 3 + 1]
      ;(p.array as Float32Array)[i * 3 + 1] = y + Math.sin(t * 0.4 + i) * 0.3
    }
    p.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color={color}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/** Architectural floor with a subtle reflective dark stone look. */
export function Floor({
  color = "#1a1d22",
  reflective = true,
}: {
  color?: string
  reflective?: boolean
}) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial
        color={color}
        roughness={reflective ? 0.3 : 0.85}
        metalness={reflective ? 0.5 : 0.1}
      />
    </mesh>
  )
}

/** A simple gallery wall. */
export function Wall({
  position,
  rotation = [0, 0, 0],
  width = 30,
  height = 9,
  color = "#23262b",
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  width?: number
  height?: number
  color?: string
}) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.05} side={THREE.DoubleSide} />
    </mesh>
  )
}

/** Ceiling plane. */
export function Ceiling({ y = 9, color = "#15171b" }: { y?: number; color?: string }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color={color} roughness={1} side={THREE.DoubleSide} />
    </mesh>
  )
}
