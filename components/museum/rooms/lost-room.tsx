"use client"

import { Text } from "@react-three/drei"
import { Floor, Wall, Ceiling, Motes } from "../three/scene-kit"
import { PedestalCase } from "../three/exhibit-displays"
import { getExhibitsForRoom } from "@/lib/museum/content"
import { LIGHTING_PRESETS } from "@/lib/museum/lighting"

/**
 * Lost Artifacts — a nearly empty, quiet room. Large glass cases hold nothing.
 * Each empty case represents an experience that could never be preserved.
 */
export function LostRoom() {
  const preset = LIGHTING_PRESETS.lost
  const exhibits = getExhibitsForRoom("lost")

  return (
    <group>
      <Floor color="#0b0c0e" />
      <Ceiling y={9} color="#070809" />
      <Wall position={[0, 4.5, -9]} color="#121315" />
      <Wall position={[-13, 4.5, 0]} rotation={[0, Math.PI / 2, 0]} color="#0f1012" />
      <Wall position={[13, 4.5, 0]} rotation={[0, -Math.PI / 2, 0]} color="#0f1012" />

      <Text
        position={[0, 6.6, -8.9]}
        fontSize={0.28}
        color="#8a929c"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.26}
      >
        HALL 03
      </Text>
      <Text
        position={[0, 5.9, -8.9]}
        fontSize={0.5}
        color="#c4cad1"
        anchorX="center"
        anchorY="middle"
      >
        Lost Artifacts
      </Text>
      <Text
        position={[0, 5.2, -8.9]}
        fontSize={0.16}
        color="#6b727b"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
        maxWidth={9}
        textAlign="center"
      >
        Some experiences could never be preserved.
      </Text>

      {exhibits.map((ex) => (
        <PedestalCase key={ex.id} exhibit={ex} accent={preset.accent} empty />
      ))}

      <Motes count={40} color="#aab4be" radius={12} speed={0.012} />
    </group>
  )
}
