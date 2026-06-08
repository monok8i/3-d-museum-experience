"use client"

import { Floor, Wall, Ceiling, Motes } from "../three/scene-kit"
import { WallExhibit } from "../three/exhibit-displays"
import { getExhibitsForRoom } from "@/lib/museum/content"
import { LIGHTING_PRESETS } from "@/lib/museum/lighting"
import { Text } from "@react-three/drei"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/**
 * Future Archive — artifacts displayed with the gravity of history, yet their
 * dates have not arrived. Cool, hopeful light and slow drifting motes.
 */
export function FutureRoom() {
  const exhibits = getExhibitsForRoom("future")
  const preset = LIGHTING_PRESETS.future
  const accent = preset.accent
  const beam = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (beam.current) {
      beam.current.intensity = 2.2 + Math.sin(state.clock.elapsedTime * 0.8) * 0.5
    }
  })

  return (
    <group>
      <Floor color="#0e1116" />
      <Ceiling y={9.5} />
      <Wall position={[0, 4.5, -8.4]} color="#161b22" />
      <Wall position={[-15, 4.5, 0]} rotation={[0, Math.PI / 2, 0]} color="#141821" />
      <Wall position={[15, 4.5, 0]} rotation={[0, -Math.PI / 2, 0]} color="#141821" />

      <Text
        position={[0, 7.4, -8.3]}
        fontSize={0.32}
        color={accent}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.28}
      >
        HALL 04 · FUTURE ARCHIVE
      </Text>
      <Text
        position={[0, 6.6, -8.3]}
        fontSize={0.58}
        color="#eef2f8"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
      >
        Memories Not Yet Made
      </Text>

      {exhibits.map((ex) => (
        <WallExhibit key={ex.id} exhibit={ex} accent={accent} />
      ))}

      {/* central hopeful beam */}
      <pointLight ref={beam} position={[0, 6, 2]} color={accent} intensity={2.2} distance={20} />
      <Motes count={120} color={accent} radius={15} speed={0.025} />
    </group>
  )
}
