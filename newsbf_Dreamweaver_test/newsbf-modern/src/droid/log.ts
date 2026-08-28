import { useSyncExternalStore } from 'react'
import type { Transmission, TransmissionKind } from './types'
import type { ProviderId, SectionId } from '@/news/types'

/**
 * A deliberately tiny observable store.
 *
 * The droid's log is append-only, capped, and read through
 * `useSyncExternalStore`, so it stays correct under concurrent rendering
 * without pulling in a state-management dependency for one list.
 */
const CAPACITY = 60

let transmissions: readonly Transmission[] = []
let sequence = 0
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

export interface RecordInput {
  readonly kind: TransmissionKind
  readonly headline: string
  readonly detail: string
  readonly providerId?: ProviderId
  readonly sectionId?: SectionId
  readonly durationMs?: number
}

/**
 * Two identical transmissions this close together are always an artifact
 * rather than news: React's StrictMode invokes effects twice in development,
 * and a page holding several desks re-reads the cache on every render pass.
 * Collapsing them keeps the handshake and translation lines — the ones worth
 * reading — from being buried under repeats.
 */
const DEDUPE_WINDOW_MS = 2_000

function isRepeat(input: RecordInput): boolean {
  const cutoff = Date.now() - DEDUPE_WINDOW_MS
  // The list is newest-first, so the scan stops as soon as it leaves the
  // window. It cannot simply compare against the head: a page holding three
  // desks interleaves their transmissions.
  for (const entry of transmissions) {
    if (entry.at < cutoff) return false
    if (
      entry.kind === input.kind &&
      entry.headline === input.headline &&
      entry.detail === input.detail
    ) {
      return true
    }
  }
  return false
}

export function record(input: RecordInput): void {
  if (isRepeat(input)) return

  sequence += 1
  const entry: Transmission = {
    id: `tx-${sequence}`,
    at: Date.now(),
    kind: input.kind,
    headline: input.headline,
    detail: input.detail,
    ...(input.providerId === undefined ? {} : { providerId: input.providerId }),
    ...(input.sectionId === undefined ? {} : { sectionId: input.sectionId }),
    ...(input.durationMs === undefined ? {} : { durationMs: input.durationMs }),
  }
  transmissions = [entry, ...transmissions].slice(0, CAPACITY)
  emit()
}

export function clearLog(): void {
  transmissions = []
  emit()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): readonly Transmission[] {
  return transmissions
}

/** Newest transmission first. */
export function useTransmissions(): readonly Transmission[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
