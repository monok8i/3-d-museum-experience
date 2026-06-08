"use client"

import { Floor, Wall, Ceiling, Motes } from "../three/scene-kit"
import { WallExhibit } from "../three/exhibit-displays"
import { getExhibitsForRoom } from "@/lib/museum/content"
import { LIGHTING_PRESETS } from "@/lib/museum/lighting"
import { Text } from "@react-three/drei"

/**
 * A standard gallery hall shell: floor, three walls, ceiling, signage, and
 * wall-mounted exhibits derived from data. Reused by Origins & Future Archive.
 */
export function GalleryHall({
  roomId,
  signage,
  title,
  accentTextColor,
}: {
  roomId: string
  signage: string
  title: string
  accentTextColor?: string
}) {
  const exhibits = getExhibitsForRoom(roomId)
  const preset =
    LIGHTING_PRESETS[roomId === "future" ? "future" : "origins"]
  const accent = accentTextColor ?? preset.accent

  return (
    <group>
      <Floor color="#15171b" />
      <Ceiling y={9} />
      {/* back wall */}
      <Wall position={[0, 4.5, -8]} color="#202329" />
      {/* side walls */}
      <Wall position={[-15, 4.5, 0]} rotation={[0, Math.PI / 2, 0]} color="#1c1f24" />
      <Wall position={[15, 4.5, 0]} rotation={[0, -Math.PI / 2, 0]} color="#1c1f24" />

      {/* signage on back wall */}
      <Text
        position={[0, 7.2, -7.9]}
        fontSize={0.34}
        color={accent}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.28}
      >
        {signage.toUpperCase()}
      </Text>
      <Text
        position={[0, 6.5, -7.9]}
        fontSize={0.62}
        color="#e8e9ec"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
      >
        {title}
      </Text>

      {exhibits.map((ex) => (
        <WallExhibit key={ex.id} exhibit={ex} accent={accent} />
      ))}

      <Motes count={90} color={accent} radius={14} speed={0.03} />
    </group>
  )
}
