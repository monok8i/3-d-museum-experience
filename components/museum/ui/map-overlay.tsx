"use client"

import { useMuseum, currentRoomId } from "@/lib/museum/store"
import { ROOMS, ROOM_ORDER, getExhibitsForRoom } from "@/lib/museum/content"
import { audioEngine } from "@/lib/museum/audio"

/**
 * Museum directory / map overlay. Shows all halls, the visitor's position,
 * visited state, and per-room artifact discovery progress. Click to teleport.
 */
export function MapOverlay() {
  const mapOpen = useMuseum((s) => s.mapOpen)
  const setMapOpen = useMuseum((s) => s.setMapOpen)
  const roomIndex = useMuseum((s) => s.roomIndex)
  const goToRoomIndex = useMuseum((s) => s.goToRoomIndex)
  const visitedRooms = useMuseum((s) => s.visitedRooms)
  const viewedExhibits = useMuseum((s) => s.viewedExhibits)

  const currentId = currentRoomId(roomIndex)

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity duration-400"
      style={{
        opacity: mapOpen ? 1 : 0,
        pointerEvents: mapOpen ? "auto" : "none",
      }}
      onClick={() => setMapOpen(false)}
    >
      <div
        className="relative mx-4 w-full max-w-2xl rounded-2xl border border-border bg-card/95 p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Директорія музею"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-museum text-primary/80">
              Директорія
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">Карта Музею</h2>
          </div>
          <button
            onClick={() => setMapOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Закрити карту"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {ROOMS.sort((a, b) => a.index - b.index).map((room) => {
            const idx = ROOM_ORDER.indexOf(room.id)
            const isCurrent = room.id === currentId
            const visited = visitedRooms.has(room.id)
            const exhibits = getExhibitsForRoom(room.id)
            const viewed = exhibits.filter((e) => viewedExhibits.has(e.id)).length

            return (
              <button
                key={room.id}
                onClick={() => {
                  audioEngine.cue("step")
                  goToRoomIndex(idx)
                }}
                className={`group flex items-center gap-4 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                  isCurrent
                    ? "border-primary/60 bg-primary/10"
                    : "border-border bg-secondary/30 hover:border-primary/40 hover:bg-secondary/60"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : visited
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {String(idx).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{room.name}</p>
                    {isCurrent && (
                      <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide-label text-primary">
                        Ви тут
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{room.subtitle}</p>
                </div>

                {exhibits.length > 0 ? (
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {viewed}/{exhibits.length}
                  </span>
                ) : (
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground/50">—</span>
                )}
              </button>
            )
          })}
        </div>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-wide-label text-muted-foreground/50">
          Оберіть зал для переміщення · Esc або клік ззовні, щоб закрити
        </p>
      </div>
    </div>
  )
}
