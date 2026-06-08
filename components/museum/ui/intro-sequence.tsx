"use client"

import { useEffect, useState, useMemo } from "react"
import { useMuseum } from "@/lib/museum/store"
import { EXHIBITION } from "@/lib/museum/content"
import { audioEngine } from "@/lib/museum/audio"
import { motion, AnimatePresence } from "framer-motion"

/**
 * Cinematic landing / intro overlay. Establishes the premise, sets a welcoming
 * tone, and gates the audio context behind a user gesture (Enter).
 */
export function IntroSequence() {
  const introComplete = useMuseum((s) => s.introComplete)
  const enterMuseum = useMuseum((s) => s.enterMuseum)
  const [stage, setStage] = useState<"initial" | "loading" | "ready" | "leaving">("initial")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (stage === "initial") {
      const t = setTimeout(() => setStage("loading"), 1500)
      return () => clearTimeout(t)
    }
    if (stage === "loading") {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval)
            setTimeout(() => setStage("ready"), 800)
            return 100
          }
          return p + Math.random() * 4
        })
      }, 80)
      return () => clearInterval(interval)
    }
  }, [stage])

  if (introComplete) return null

  const handleEnter = async () => {
    await audioEngine.resume()
    audioEngine.transitionTo("lobby")
    audioEngine.cue("open")
    setStage("leaving")
    setTimeout(() => enterMuseum(), 1200)
  }

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center overflow-hidden bg-black text-center"
      style={{
        background: "black",
      }}
    >
      {/* Background Particles (CSS simulated) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/40 blur-[1px]"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animation: `float ${Math.random() * 10 + 20}s infinite linear`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {stage === "initial" && (
          <motion.div
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/60">
              Музей людських історій
            </p>
          </motion.div>
        )}

        {stage === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <p className="font-mono text-[10px] uppercase tracking-museum text-primary/80">
              Завантаження {EXHIBITION.code}...
            </p>
            <div className="mt-4 h-px w-48 bg-white/10">
              <motion.div
                className="h-full bg-primary/60"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 font-mono text-[9px] text-white/30">{Math.floor(progress)}%</p>
          </motion.div>
        )}

        {(stage === "ready" || stage === "leaving") && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: stage === "leaving" ? 0 : 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center px-6"
          >
            <p className="mb-6 font-mono text-[11px] uppercase tracking-museum text-primary/80">
              {EXHIBITION.code}
            </p>
            <h1 className="text-balance font-sans text-5xl font-semibold tracking-tight text-white sm:text-7xl md:text-8xl">
              Музей Нашого
              <br />
              Майбутнього
            </h1>
            <p className="mt-8 max-w-md text-pretty text-base leading-relaxed text-neutral-400 sm:text-lg">
              Імерсивна виставка, що зберігає єдину людську історію — її витоки,
              втрачені миті та спогади, які ще не сталися.
            </p>

            <button
              onClick={handleEnter}
              className="group mt-12 inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/5 px-8 py-4 text-sm font-medium uppercase tracking-wide-label text-white backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:bg-primary/15 hover:shadow-[0_0_40px_-8px] hover:shadow-primary/40"
            >
              Увійти до музею
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>

            <p className="mt-12 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
              Найкраще сприймається зі звуком · рекомендуємо навушники
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-100px) translateX(20px); }
          100% { transform: translateY(-200px) translateX(0); }
        }
      `}</style>
    </div>
  )
}
