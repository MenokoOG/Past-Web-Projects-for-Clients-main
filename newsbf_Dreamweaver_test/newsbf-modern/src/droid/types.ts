import type { ProviderId, SectionId } from '@/news/types'

/**
 * The droid narrates in six registers. They map to how the transmission log is
 * coloured, so keep them semantic rather than decorative.
 */
export type TransmissionKind =
  /** Opening a channel to an upstream provider. */
  | 'handshake'
  /** Rewriting one vocabulary into another. */
  | 'translate'
  /** A completed exchange. */
  | 'success'
  /** Served from memory without touching the network. */
  | 'cache'
  /** Degraded but recoverable. */
  | 'warning'
  /** The exchange failed. */
  | 'fault'

export interface Transmission {
  readonly id: string
  readonly at: number
  readonly kind: TransmissionKind
  /** One-line summary, written in the droid's voice. */
  readonly headline: string
  /** The literal technical fact behind the headline. */
  readonly detail: string
  readonly providerId?: ProviderId
  readonly sectionId?: SectionId
  /** Wall-clock duration of the exchange, when it was measurable. */
  readonly durationMs?: number
}

/** One row of the legacy → modern translation ledger. */
export interface LedgerEntry {
  readonly id: string
  /** What the 2012 site did. */
  readonly legacy: string
  /** The file it lived in, relative to the repository root. */
  readonly legacyPath: string
  /** What replaced it. */
  readonly modern: string
  /** Where the replacement lives in this app. */
  readonly modernPath: string
  readonly category: LedgerCategory
  /** Why the change matters — the part a stakeholder actually reads. */
  readonly rationale: string
}

export type LedgerCategory =
  | 'markup'
  | 'layout'
  | 'styling'
  | 'content'
  | 'data'
  | 'analytics'
  | 'accessibility'
