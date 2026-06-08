/**
 * Museum of Our Future — Core content type system.
 *
 * Everything in the museum is data-driven. UI and 3D components consume these
 * models and never hardcode exhibit content. To expand the museum, add data to
 * `lib/museum/content.ts` (or future CMS sources) — no component changes needed.
 */

export type LightingTheme =
  | "lobby"
  | "origins"
  | "lab"
  | "lost"
  | "future"
  | "observatory"
  | "constellation"
  | "final"

export type ExhibitType =
  | "photo"
  | "video"
  | "text"
  | "audio"
  | "future"
  | "invisible"

export type ExhibitStatus =
  | "archived"
  | "reconstructing"
  | "impossible"
  | "no-recording"
  | "tech-limitation"
  | "awaiting-creation"
  | "pending"
  | "predicted"
  | "possible"

export type MediaAsset = {
  kind: "image" | "video" | "audio"
  /** Public path or remote URL. Optional for future/invisible artifacts. */
  src?: string
  alt?: string
}

export type Exhibit = {
  id: string
  roomId: string
  title: string
  /** Museum catalogue code, e.g. "A-001" or "L-14". */
  artifactCode: string
  /** Display year. May be a future year for future artifacts. */
  year: string
  category: string
  type: ExhibitType
  description: string
  /** Short plaque line shown when approaching the exhibit. */
  plaque?: string
  media?: MediaAsset
  status?: ExhibitStatus
  /** Local position within the room (x, y, z) for placement on walls/pedestals. */
  position?: [number, number, number]
}

export type RoomKind =
  | "lobby"
  | "gallery"
  | "lab"
  | "lost"
  | "future"
  | "observatory"
  | "constellation"
  | "final"

export type MuseumRoom = {
  id: string
  index: number
  name: string
  /** Short wayfinding label, e.g. "Hall 01". */
  signage: string
  description: string
  kind: RoomKind
  lightingTheme: LightingTheme
  ambientAudio?: string
  /** Narrative subtitle shown on room entry. */
  subtitle?: string
}

export type Exhibition = {
  id: string
  code: string
  title: string
  subtitle: string
  rooms: MuseumRoom[]
}

/** Human-readable labels for statuses, used in plaques & viewers. */
export const STATUS_LABELS: Record<ExhibitStatus, string> = {
  archived: "Архівовано",
  reconstructing: "Відновлення",
  impossible: "Неможливо архівувати",
  "no-recording": "Запис відсутній",
  "tech-limitation": "Технологічне обмеження",
  "awaiting-creation": "Очікує створення",
  pending: "У процесі",
  predicted: "Прогнозована хронологія",
  possible: "Можливе майбутнє",
}
