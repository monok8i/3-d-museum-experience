"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { Floor, Wall, Ceiling } from "../three/scene-kit"
import { WallExhibit } from "../three/exhibit-displays"
import { getExhibitsForRoom } from "@/lib/museum/content"
import { LIGHTING_PRESETS } from "@/lib/museum/lighting"

/**
 * The reconstruction machine: a vertical column of particles that perpetually
 * gather and disperse, suggesting memories assembling from data.
 */
function ReconstructionMachine({ accent }: { accent: string }) {
  const count = 1200
  const ref = useRef<THREE.Points>(null)
  const ring = useRef<THREE.Mesh>(null)

  const { positions, targets, randoms } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const targets = new Float32Array(count * 3)
    const randoms = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // dispersed origin
      const r = 3 + Math.random() * 3
      const a = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = Math.random() * 6
      positions[i * 3 + 2] = Math.sin(a) * r
      // assembled target: a loose human-scale column/figure silhouette
      const t = Math.random()
      const tr = (0.4 + Math.random() * 0.5) * (1 - Math.abs(t - 0.5))
      const ta = Math.random() * Math.PI * 2
      targets[i * 3] = Math.cos(ta) * tr
      targets[i * 3 + 1] = 0.6 + t * 4.4
      targets[i * 3 + 2] = Math.sin(ta) * tr
      randoms[i] = Math.random()
    }
    return { positions, targets, randoms }
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    // phase cycles 0..1 (assemble) then 1..2 (hold) then disperse
    const cycle = (Math.sin(t * 0.25) + 1) / 2 // 0..1 smooth
    const arr = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      const mix = Math.min(1, Math.max(0, cycle + (randoms[i] - 0.5) * 0.3))
      arr[ix] = THREE.MathUtils.lerp(positions[ix], targets[ix], mix) + Math.sin(t + i) * 0.01
      arr[ix + 1] = THREE.MathUtils.lerp(positions[ix + 1], targets[ix + 1], mix)
      arr[ix + 2] = THREE.MathUtils.lerp(positions[ix + 2], targets[ix + 2], mix) + Math.cos(t + i) * 0.01
    }
    ref.current.geometry.attributes.position.needsUpdate = true
    ref.current.rotation.y = t * 0.1

    if (ring.current) {
      ring.current.rotation.z = t * 0.5
      ring.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05)
    }
  })

  return (
    <group position={[0, 0, -3]}>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color={accent}
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* base scanner ring */}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <torusGeometry args={[2.4, 0.04, 8, 64]} />
        <meshBasicMaterial color={accent} transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[2.4, 48]} />
        <meshBasicMaterial color={accent} transparent opacity={0.05} />
      </mesh>
      <pointLight position={[0, 3, 0]} color={accent} intensity={6} distance={12} />
    </group>
  )
}

export function LabRoom() {
  const preset = LIGHTING_PRESETS.lab
  const exhibits = getExhibitsForRoom("lab")

  return (
    <group>
      <Floor color="#0e1217" />
      <Ceiling y={9} color="#0a0d11" />
      <Wall position={[0, 4.5, -9]} color="#161b21" />
      <Wall position={[-14, 4.5, 0]} rotation={[0, Math.PI / 2, 0]} color="#13171c" />
      <Wall position={[14, 4.5, 0]} rotation={[0, -Math.PI / 2, 0]} color="#13171c" />

      <Text
        position={[0, 7, -8.9]}
        fontSize={0.3}
        color={preset.accent}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.26}
      >
        HALL 02
      </Text>
      <Text
        position={[0, 6.3, -8.9]}
        fontSize={0.55}
        color="#e8edf2"
        anchorX="center"
        anchorY="middle"
        maxWidth={12}
        textAlign="center"
      >
        Memory Reconstruction Lab
      </Text>

      <ReconstructionMachine accent={preset.accent} />

      {exhibits.map((ex) => (
        <WallExhibit key={ex.id} exhibit={ex} accent={preset.accent} />
      ))}
    </group>
  )
}
