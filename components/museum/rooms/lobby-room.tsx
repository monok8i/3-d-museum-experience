"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, RoundedBox, Html } from "@react-three/drei"
import * as THREE from "three"
import { Floor, Wall, Ceiling, Motes } from "../three/scene-kit"
import { EXHIBITION } from "@/lib/museum/content"
import { LIGHTING_PRESETS } from "@/lib/museum/lighting"
import { useMuseum } from "@/lib/museum/store"
import { audioEngine } from "@/lib/museum/audio"

/**
 * The Lobby — the grand threshold. Large architectural volume, central
 * information terminal, and the exhibition title in light.
 */
export function LobbyRoom() {
  const preset = LIGHTING_PRESETS.lobby
  const beam = useRef<THREE.Mesh>(null)
  const leftDoor = useRef<THREE.Group>(null)
  const rightDoor = useRef<THREE.Group>(null)
  const introComplete = useMuseum((s) => s.introComplete)
  const nextRoom = useMuseum((s) => s.nextRoom)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (beam.current) {
      const mat = beam.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.05 + Math.sin(state.clock.elapsedTime * 0.6) * 0.02
    }

    // Animate doors
    if (leftDoor.current && rightDoor.current) {
      const targetX = introComplete ? -6 : 0
      leftDoor.current.position.x = THREE.MathUtils.lerp(leftDoor.current.position.x, targetX, 0.05)
      rightDoor.current.position.x = THREE.MathUtils.lerp(rightDoor.current.position.x, -targetX, 0.05)
    }
  })

  return (
    <group>
      <Floor color="#191c21" />
      <Ceiling y={12} color="#101216" />
      <Wall position={[0, 6, -12]} height={12} width={40} color="#22252b" />
      <Wall position={[-18, 6, 0]} height={12} rotation={[0, Math.PI / 2, 0]} color="#1d2025" />
      <Wall position={[18, 6, 0]} height={12} rotation={[0, -Math.PI / 2, 0]} color="#1d2025" />

      {/* Entrance Doors (at z=8) */}
      <group position={[0, 0, 8]}>
        <group ref={leftDoor} position={[0, 5, 0]}>
          <mesh position={[-3, 0, 0]}>
            <boxGeometry args={[6, 10, 0.5]} />
            <meshStandardMaterial color="#1d2025" roughness={0.4} metalness={0.2} />
          </mesh>
        </group>
        <group ref={rightDoor} position={[0, 5, 0]}>
          <mesh position={[3, 0, 0]}>
            <boxGeometry args={[6, 10, 0.5]} />
            <meshStandardMaterial color="#1d2025" roughness={0.4} metalness={0.2} />
          </mesh>
        </group>
        {/* Door frame */}
        <mesh position={[0, 5, -0.1]}>
          <boxGeometry args={[12.4, 10.4, 0.2]} />
          <meshStandardMaterial color="#0a0c0f" />
        </mesh>
      </group>

      {/* exhibition signage */}
      <Text
        position={[0, 8.4, -11.8]}
        fontSize={0.4}
        color={preset.accent}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.3}
      >
        {EXHIBITION.code.toUpperCase()}
      </Text>
      <Text
        position={[0, 7.3, -11.8]}
        fontSize={1.3}
        color="#f1f2f4"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.02}
      >
        {EXHIBITION.title}
      </Text>
      <Text
        position={[0, 6.3, -11.8]}
        fontSize={0.4}
        color="#aeb6c0"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
      >
        {EXHIBITION.subtitle}
      </Text>

      {/* central information terminal */}
      <group position={[0, 0, -2]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[3.2, 1, 1.4]} />
          <meshStandardMaterial color="#15171b" roughness={0.6} metalness={0.3} />
        </mesh>
        <RoundedBox args={[3, 1.1, 0.12]} radius={0.04} position={[0, 1.35, 0.55]} rotation={[-0.5, 0, 0]}>
          <meshStandardMaterial
            color="#0a0c0f"
            emissive={preset.accent}
            emissiveIntensity={hovered ? 0.6 : 0.3}
            roughness={0.3}
            metalness={0.4}
          />
        </RoundedBox>
        
        <Html transform position={[0, 1.38, 0.64]} rotation={[-0.5, 0, 0]} distanceFactor={3.2}>
          <div className="flex w-[600px] flex-col items-center justify-center text-center">
            <h3 className="font-mono text-[14px] uppercase tracking-museum text-primary">Інформаційний термінал</h3>
            <p className="mt-4 px-12 text-[11px] leading-relaxed text-neutral-400">
              Вітаємо. Ця виставка зберігає єдину людську історію — її витоки, втрачені миті та спогади, які ще не сталися.
            </p>
            <button
              onPointerOver={() => setHovered(true)}
              onPointerOut={() => setHovered(false)}
              onClick={() => {
                audioEngine.cue("open")
                nextRoom()
              }}
              className="mt-8 rounded-full border border-primary/40 bg-primary/10 px-8 py-3 font-mono text-[10px] uppercase tracking-wide-label text-white transition-all hover:bg-primary/30"
            >
              Розпочати візит
            </button>
          </div>
        </Html>
        
        <pointLight position={[0, 1.6, 1]} color={preset.accent} intensity={hovered ? 5 : 3} distance={6} />
      </group>

      {/* floor accent guide line toward the first hall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -7]}>
        <planeGeometry args={[0.12, 8]} />
        <meshBasicMaterial color={preset.accent} transparent opacity={0.4} />
      </mesh>

      {/* volumetric light shaft */}
      <mesh ref={beam} position={[0, 6, -6]}>
        <coneGeometry args={[5, 12, 32, 1, true]} />
        <meshBasicMaterial
          color={preset.accent}
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Motes count={120} color={preset.accent} radius={16} speed={0.02} />
    </group>
  )
}
