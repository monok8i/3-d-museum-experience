"use client"

import { useEffect, useState } from "react"
import { useMuseum, currentRoomId } from "@/lib/museum/store"
import { ROOMS, ROOM_ORDER, getExhibitsForRoom } from "@/lib/museum/content"
import { audioEngine } from "@/lib/museum/audio"

/** Top-left identity + top-right controls. */
export function TopBar() {
  const muted = useMuseum((s) => s.muted)
  const toggleMute = useMuseum((s) => s.toggleMute)
  const toggleMap = useMuseum((s) => s.toggleMap)
  const mapOpen = useMuseum((s) => s.mapOpen)
  const introComplete = useMuseum((s) => s.introComplete)

  if (!introComplete) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-5 sm:p-6">
      <div className="pointer-events-auto animate-museum-fade-in">
        <p className="font-mono text-[10px] uppercase tracking-museum text-primary/80">
          Виставка №4271
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">Музей Нашого Майбутнього</p>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <HudButton onClick={toggleMute} label={muted ? "Увімк. звук" : "Вимк. звук"} active={!muted}>
          {muted ? "♪̸" : "♪"}
        </HudButton>
        <HudButton onClick={toggleMap} label="Карта" active={mapOpen}>
          ◴
        </HudButton>
      </div>
    </div>
  )
}

function HudButton({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-10 items-center gap-2 rounded-full border px-4 text-sm backdrop-blur-md transition-all duration-300 ${active
          ? "border-primary/50 bg-primary/10 text-foreground"
          : "border-border bg-card/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
        }`}
    >
      <span className="text-base leading-none">{children}</span>
      <span className="hidden font-mono text-[10px] uppercase tracking-wide-label sm:inline">
        {label}
      </span>
    </button>
  )
}

/** Bottom navigation: room title, progress dots, prev/next. */
export function NavBar() {
  const roomIndex = useMuseum((s) => s.roomIndex)
  const nextRoom = useMuseum((s) => s.nextRoom)
  const prevRoom = useMuseum((s) => s.prevRoom)
  const goToRoomIndex = useMuseum((s) => s.goToRoomIndex)
  const introComplete = useMuseum((s) => s.introComplete)
  const activeExhibit = useMuseum((s) => s.activeExhibit)

  if (!introComplete) return null

  const roomId = currentRoomId(roomIndex)
  const room = ROOMS.find((r) => r.id === roomId)
  const total = ROOM_ORDER.length
  const atStart = roomIndex === 0
  const atEnd = roomIndex === total - 1

  const handleNav = (dir: 1 | -1) => {
    audioEngine.cue(dir === 1 ? "open" : "close")
    dir === 1 ? nextRoom() : prevRoom()
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-4 p-5 transition-opacity duration-500 sm:p-7"
      style={{ opacity: activeExhibit ? 0.25 : 1 }}
    >
      {/* progress dots */}
      <div className="pointer-events-auto flex items-center gap-2">
        {ROOM_ORDER.map((id, i) => (
          <button
            key={id}
            onClick={() => {
              audioEngine.cue("step")
              goToRoomIndex(i)
            }}
            aria-label={`Перейти до ${ROOMS.find((r) => r.id === id)?.name}`}
            className="group relative flex h-4 items-center"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 ${i === roomIndex
                  ? "w-7 bg-primary"
                  : i < roomIndex
                    ? "w-1.5 bg-primary/40"
                    : "w-1.5 bg-muted-foreground/30 group-hover:bg-muted-foreground/60"
                }`}
            />
          </button>
        ))}
      </div>

      <div className="pointer-events-auto flex w-full max-w-2xl items-center justify-between gap-4">
        <button
          onClick={() => handleNav(-1)}
          disabled={atStart}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card/50 text-foreground backdrop-blur-md transition-all duration-300 hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-25"
          aria-label="Попередній зал"
        >
          ←
        </button>

        <div className="flex-1 text-center">
          <p className="font-mono text-[10px] uppercase tracking-museum text-primary/70">
            {room?.signage}
          </p>
          <h2 className="mt-0.5 text-balance text-lg font-medium text-foreground sm:text-xl">
            {room?.name}
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {getExhibitsForRoom(roomId).length > 0
              ? `${getExhibitsForRoom(roomId).length} артефактів · натисніть для огляду`
              : room?.subtitle}
          </p>
        </div>

        <button
          onClick={() => handleNav(1)}
          disabled={atEnd}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-foreground backdrop-blur-md transition-all duration-300 hover:border-primary/70 hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-25"
          aria-label="Наступний зал"
        >
          →
        </button>
      </div>
    </div>
  )
}

/** Large room-entry subtitle that fades in/out on room change. */
export function RoomIntro() {
  const roomIndex = useMuseum((s) => s.roomIndex)
  const introComplete = useMuseum((s) => s.introComplete)
  const [visible, setVisible] = useState(false)
  const [shown, setShown] = useState<{ name: string; subtitle?: string; signage: string } | null>(
    null,
  )

  useEffect(() => {
    if (!introComplete) return
    const room = ROOMS.find((r) => r.id === currentRoomId(roomIndex))
    if (!room) return
    setShown({ name: room.name, subtitle: room.subtitle, signage: room.signage })
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 3200)
    return () => clearTimeout(t)
  }, [roomIndex, introComplete])

  if (!introComplete || !shown) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-1000"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-museum text-primary/70">
          {shown.signage}
        </p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground text-shadow-glow sm:text-6xl">
          {shown.name}
        </h1>
        {shown.subtitle && (
          <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
            {shown.subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
