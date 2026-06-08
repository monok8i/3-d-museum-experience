"use client"

import { useEffect } from "react"
import { useMuseum } from "@/lib/museum/store"
import { STATUS_LABELS } from "@/lib/museum/types"
import { audioEngine } from "@/lib/museum/audio"

/**
 * Exhibit detail viewer. Slides in from the right when an exhibit is selected
 * in the 3D scene. Renders media (image) plus full curatorial text.
 */
export function ExhibitViewer() {
  const exhibit = useMuseum((s) => s.activeExhibit)
  const closeExhibit = useMuseum((s) => s.closeExhibit)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && exhibit) {
        audioEngine.cue("close")
        closeExhibit()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [exhibit, closeExhibit])

  const open = Boolean(exhibit)
  const hasImage = exhibit?.media?.kind === "image" && exhibit.media.src

  const handleClose = () => {
    audioEngine.cue("close")
    closeExhibit()
  }

  return (
    <>
      {/* backdrop */}
      <div
        className="absolute inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-500"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={handleClose}
        aria-hidden
      />

      {/* panel */}
      <aside
        className="absolute right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card/95 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] no-scrollbar"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
        role="dialog"
        aria-modal="true"
        aria-label={exhibit?.title ?? "Деталі експонату"}
      >
        {exhibit && (
          <div className="flex flex-1 flex-col">
            {/* header bar */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <span className="font-mono text-[11px] uppercase tracking-wide-label text-primary">
                Код артефакту: {exhibit.artifactCode}
              </span>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                aria-label="Закрити"
              >
                ✕
              </button>
            </div>

            {/* media */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
              {hasImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={exhibit.media!.src!}
                  alt={exhibit.media!.alt ?? exhibit.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <EmptyArtifactVisual label={exhibit.status ? STATUS_LABELS[exhibit.status] : exhibit.category} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
            </div>

            {/* body */}
            <div className="flex flex-1 flex-col px-6 py-6">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-secondary px-3 py-1 font-mono text-[10px] uppercase tracking-wide-label text-secondary-foreground">
                  {exhibit.category}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">{exhibit.year}</span>
              </div>

              <h2 className="mt-4 text-pretty text-3xl font-semibold leading-tight text-foreground">
                {exhibit.title}
              </h2>

              {exhibit.status && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="font-mono text-[11px] uppercase tracking-wide-label text-primary/90">
                    {STATUS_LABELS[exhibit.status]}
                  </span>
                </div>
              )}

              <p className="mt-6 text-pretty text-[15px] leading-relaxed text-muted-foreground">
                {exhibit.description}
              </p>

              {exhibit.plaque && (
                <blockquote className="mt-6 border-l-2 border-primary/40 pl-4 font-serif text-base italic leading-relaxed text-foreground/80">
                  {exhibit.plaque}
                </blockquote>
              )}

              <div className="mt-auto pt-8">
                <div className="h-px w-full bg-border" />
                <p className="mt-4 font-mono text-[10px] uppercase tracking-wide-label text-muted-foreground/60">
                  Каталог {exhibit.artifactCode} · Музей Нашого Майбутнього
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

/** Visual stand-in for invisible / unmade artifacts. */
function EmptyArtifactVisual({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-muted to-card">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 animate-pulse rounded-full border border-primary/30" />
        <div className="absolute inset-3 rounded-full border border-primary/20" />
        <div className="absolute inset-6 rounded-full bg-primary/10" />
      </div>
      <p className="font-mono text-[11px] uppercase tracking-wide-label text-muted-foreground">
        {label}
      </p>
      <p className="max-w-[200px] text-center text-xs text-muted-foreground/60">
        Артефакт неможливо зафіксувати. Цей простір залишено вільним навмисно.
      </p>
    </div>
  )
}
