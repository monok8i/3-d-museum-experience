"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Html, Text, Stars, Sparkles } from "@react-three/drei"
import * as THREE from "three"
import { Floor, Wall, Ceiling } from "../three/scene-kit"
import { useMuseum } from "@/lib/museum/store"
import { audioEngine } from "@/lib/museum/audio"
import { motion, AnimatePresence } from "framer-motion"

/**
 * The Revelation — a stark, near-white chamber. A projection panel on the far
 * wall fades through the closing message, revealing that the "exhibition" is a
 * love letter to a real, ongoing story that is still being written.
 */
export function FinalRoom() {
  const [revealed, setRevealed] = useState(false)
  const [wallOpen, setWallOpen] = useState(false)
  const [canShowPortal, setCanShowPortal] = useState(false)
  
  const panel = useRef<THREE.Mesh>(null)
  const leftWall = useRef<THREE.Group>(null)
  const rightWall = useRef<THREE.Group>(null)

  const showFinalLetter = useMuseum((s) => s.showFinalLetter)
  const setShowFinalLetter = useMuseum((s) => s.setShowFinalLetter)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 800)
    return () => clearTimeout(t)
  }, [])

  useFrame((state) => {
    if (panel.current) {
      const m = panel.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 0.8) * 0.12
    }

    if (wallOpen && leftWall.current && rightWall.current) {
      leftWall.current.position.x = THREE.MathUtils.lerp(leftWall.current.position.x, -12, 0.015)
      rightWall.current.position.x = THREE.MathUtils.lerp(rightWall.current.position.x, 12, 0.015)
    }
  })

  return (
    <group>
      <Floor color="#e9e7e2" reflective />
      <Ceiling y={10} color="#f4f2ee" />
      
      {/* Cosmic background behind the wall */}
      <group position={[0, 4, -15]}>
        <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </group>

      {/* Splitting Wall */}
      <group position={[0, 0, -8]}>
        <group ref={leftWall} position={[0, 0, 0]}>
          <mesh position={[-7.5, 5, 0]}>
            <boxGeometry args={[15, 10, 0.5]} />
            <meshStandardMaterial color="#f1efe9" />
          </mesh>
        </group>
        <group ref={rightWall} position={[0, 0, 0]}>
          <mesh position={[7.5, 5, 0]}>
            <boxGeometry args={[15, 10, 0.5]} />
            <meshStandardMaterial color="#f1efe9" />
          </mesh>
        </group>
      </group>

      <Wall position={[-15, 5, 0]} rotation={[0, Math.PI / 2, 0]} color="#eceae4" />
      <Wall position={[15, 5, 0]} rotation={[0, -Math.PI / 2, 0]} color="#eceae4" />

      {/* glowing projection panel - only visible while wall is closed */}
      {!wallOpen && (
        <mesh ref={panel} position={[0, 4.4, -7.8]}>
          <planeGeometry args={[9, 5]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      )}

      {/* Narrative text - handled inside a single Html to avoid THREE namespace errors */}
      <RevelationText 
        revealed={revealed} 
        active={!wallOpen}
        onComplete={() => {
          setWallOpen(true)
          setTimeout(() => setCanShowPortal(true), 1500)
        }} 
      />

      {canShowPortal && !showFinalLetter && (
        <FinalPortal 
          onEnter={() => setShowFinalLetter(true)} 
        />
      )}

      {!wallOpen && (
        <Text
          position={[0, 1.2, -7.7]}
          fontSize={0.18}
          color="#8a8780"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.3}
        >
          ВИСТАВКА №4271 · СТАТУС: ТРИВАЄ
        </Text>
      )}

      {/* bright, even gallery light */}
      <ambientLight intensity={0.9} color="#fffdf8" />
      <pointLight position={[0, 8, 2]} intensity={2.4} color="#fffaf2" distance={30} />
      <pointLight position={[0, 4, -6]} intensity={2} color="#ffffff" distance={20} />
    </group>
  )
}

function FinalPortal({ onEnter }: { onEnter: () => void }) {
  const [hovered, setHovered] = useState(false)
  const portal = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (portal.current) {
      const s = 1.8 + Math.sin(t * 1.5) * 0.1 + (hovered ? 0.3 : 0)
      portal.current.scale.set(s, s, s)
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.2
      const s = 2.2 + Math.sin(t * 1.2) * 0.2 + (hovered ? 0.4 : 0)
      ring.current.scale.set(s, s, s)
    }
  })

  return (
    <group position={[0, 4, -13]}>
      <Sparkles count={100} scale={6} size={4} speed={0.4} color="#ffffff" />
      
      {/* Central Light Void */}
      <mesh
        ref={portal}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = "auto"
        }}
        onClick={(e) => {
          e.stopPropagation()
          audioEngine.cue("open")
          onEnter()
        }}
      >
        <circleGeometry args={[2.5, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
      </mesh>

      {/* Swirling Outer Ring */}
      <mesh ref={ring}>
        <ringGeometry args={[2.6, 2.8, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>

      <pointLight color="#ffffff" intensity={hovered ? 10 : 6} distance={20} />
      
      <Html center position={[0, -3.5, 0]}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none select-none text-center"
        >
          <div className="mb-2 h-12 w-px bg-gradient-to-b from-transparent to-white/40 mx-auto" />
          <p className="font-mono text-[11px] uppercase tracking-[0.5em] text-white animate-pulse">
            {hovered ? "Увійти назавжди" : "Натисни, щоб відкрити серце"}
          </p>
        </motion.div>
      </Html>
    </group>
  )
}

function RevelationText({ revealed, active, onComplete }: { revealed: boolean, active: boolean, onComplete: () => void }) {
  const lines = [
    "Сканування архіву...",
    "Архів завершено.",
    "Збережених спогадів: 24",
    "Майбутніх спогадів: 2847",
    "Аналіз...",
    "Більшість артефактів ще не існують.",
    "",
    "Ця виставка унікальна.",
    "",
    "Вона ніколи не створювалася, щоб зберегти минуле.",
    "",
    "Вона була створена, щоб зберегти надію на майбутнє.",
    "",
    "Статус виставки: ВСЕ ЩЕ ПИШЕТЬСЯ",
  ]
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!revealed) return
    
    let timer: NodeJS.Timeout
    const playNext = (index: number) => {
      if (index >= lines.length) {
        setTimeout(onComplete, 2500)
        return
      }

      setStep(index + 1)
      if (lines[index] !== "") {
        audioEngine.cue("step")
      }
      
      const delay = lines[index] === "" ? 1000 : lines[index].includes("...") ? 1800 : 1400
      timer = setTimeout(() => playNext(index + 1), delay)
    }

    playNext(0)
    return () => clearTimeout(timer)
  }, [revealed, lines.length, onComplete])

  return (
    <Html transform position={[0, 4.7, -7.65]} distanceFactor={8} zIndexRange={[30, 0]} pointerEvents="none">
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.5 }}
            className="pointer-events-none w-[720px] select-none text-center"
          >
            <div className="mb-10 font-mono text-[11px] uppercase tracking-museum text-neutral-500">
              Аналіз у процесі
            </div>
            <div className="space-y-4">
              {lines.map((line, i) => (
                <p
                  key={i}
                  className={`font-serif leading-snug transition-all duration-1000 ${
                    line === "" ? "h-4" : ""
                  } ${
                    i === lines.length - 1 ? "text-[24px] font-bold text-neutral-950 mt-8" : "text-[18px] text-neutral-800"
                  }`}
                  style={{
                    opacity: step > i ? 1 : 0,
                    transform: `translateY(${step > i ? 0 : 12}px)`,
                    filter: step > i ? "blur(0px)" : "blur(4px)",
                    display: step > i || line === "" ? "block" : "none"
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Html>
  )
}
