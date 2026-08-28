import type { Article, ProviderId, SectionId } from './types'
import { NewsProviderError } from './types'
import { getProvider, DEFAULT_PROVIDER_ID } from './registry'
import { getSection } from './sections'
import { record } from '@/droid/log'

const CACHE_TTL_MS = 5 * 60 * 1000

interface CacheEntry {
  readonly articles: readonly Article[]
  readonly storedAt: number
}

/**
 * A module-scoped TTL cache.
 *
 * The 2012 site made a fresh round trip for every navigation because every
 * page was a separate document. Keeping five minutes of results in memory is
 * the cheapest possible upgrade, and it also keeps the demo inside the free
 * rate limits when someone clicks quickly through the desks.
 */
const cache = new Map<string, CacheEntry>()

function cacheKey(providerId: ProviderId, sectionId: SectionId, limit: number): string {
  return `${providerId}:${sectionId}:${limit}`
}

export interface FetchOptions {
  readonly providerId?: ProviderId
  readonly limit?: number
  readonly signal?: AbortSignal
  /** Skip the cache — used by the reader-facing refresh control. */
  readonly force?: boolean
}

export interface FetchResult {
  readonly articles: readonly Article[]
  readonly providerId: ProviderId
  readonly fromCache: boolean
  /** Set when the requested provider failed and a fallback answered instead. */
  readonly fellBackFrom?: ProviderId
}

/**
 * Fetch one desk, narrating each step to the droid's transmission log.
 *
 * The narration is the point: every entry the reader sees in the log is a real
 * event from this function, not a scripted animation.
 */
export async function fetchSection(
  sectionId: SectionId,
  options: FetchOptions = {},
): Promise<FetchResult> {
  const providerId = options.providerId ?? DEFAULT_PROVIDER_ID
  const limit = options.limit ?? 12
  const provider = getProvider(providerId)
  const section = getSection(sectionId)
  const key = cacheKey(providerId, sectionId, limit)

  if (!options.force) {
    const hit = cache.get(key)
    if (hit && Date.now() - hit.storedAt < CACHE_TTL_MS) {
      record({
        kind: 'cache',
        headline: `${section.label} recalled from memory.`,
        detail: `${hit.articles.length} articles held from ${provider.label}, still inside the ${
          CACHE_TTL_MS / 60_000
        }-minute window. No request was made.`,
        providerId,
        sectionId,
      })
      return { articles: hit.articles, providerId, fromCache: true }
    }
  }

  const blocked = provider.unavailableReason()
  if (blocked) {
    record({
      kind: 'warning',
      headline: `${provider.label} is not accepting connections.`,
      detail: blocked,
      providerId,
      sectionId,
    })
    return fallback(sectionId, providerId, limit, options.signal)
  }

  const fidelity = provider.fidelity(sectionId)
  record({
    kind: 'handshake',
    headline: `Opening a channel to ${provider.label}.`,
    detail: `Requesting the ${section.label} desk, ${limit} items.`,
    providerId,
    sectionId,
  })
  record({
    kind: 'translate',
    headline:
      fidelity === 'native'
        ? `${provider.label} speaks this desk natively.`
        : `Translating "${section.label}" into a dialect ${provider.label} understands.`,
    detail: provider.describeQuery(sectionId),
    providerId,
    sectionId,
  })

  const startedAt = performance.now()
  try {
    const controller = new AbortController()
    options.signal?.addEventListener('abort', () => {
      controller.abort()
    })
    const articles = await provider.fetchSection({
      sectionId,
      limit,
      signal: controller.signal,
    })
    const durationMs = Math.round(performance.now() - startedAt)

    if (articles.length === 0) {
      record({
        kind: 'warning',
        headline: `${provider.label} answered, but the desk is empty.`,
        detail: 'The request succeeded and returned zero articles.',
        providerId,
        sectionId,
        durationMs,
      })
    } else {
      record({
        kind: 'success',
        headline: `${articles.length} articles translated into the house format.`,
        detail: `${provider.label} → Article[]. Fields normalized: title, summary, byline, image, published date.`,
        providerId,
        sectionId,
        durationMs,
      })
    }

    cache.set(key, { articles, storedAt: Date.now() })
    return { articles, providerId, fromCache: false }
  } catch (error) {
    if (isAbort(error)) throw error

    record({
      kind: 'fault',
      headline: `${provider.label} broke off the exchange.`,
      detail: describeError(error),
      providerId,
      sectionId,
      durationMs: Math.round(performance.now() - startedAt),
    })
    return fallback(sectionId, providerId, limit, options.signal)
  }
}

/**
 * When the chosen provider cannot answer, try the next keyless one rather than
 * showing the reader an error. A local paper that goes blank is worse than a
 * local paper quoting a different wire service.
 */
async function fallback(
  sectionId: SectionId,
  failedId: ProviderId,
  limit: number,
  signal: AbortSignal | undefined,
): Promise<FetchResult> {
  const candidates: readonly ProviderId[] = ['guardian', 'spaceflight', 'hackernews']
  const next = candidates.find(
    (id) => id !== failedId && getProvider(id).unavailableReason() === null,
  )

  if (!next) {
    throw new NewsProviderError(failedId, 'No news provider is currently reachable.')
  }

  record({
    kind: 'translate',
    headline: `Switching to ${getProvider(next).label} to keep the desk filled.`,
    detail: `${getProvider(failedId).label} is unavailable; falling back automatically.`,
    providerId: next,
    sectionId,
  })

  const result = await fetchSection(sectionId, {
    providerId: next,
    limit,
    ...(signal ? { signal } : {}),
  })
  return { ...result, fellBackFrom: failedId }
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function describeError(error: unknown): string {
  if (error instanceof NewsProviderError) return error.message
  if (error instanceof TypeError) {
    return `Network or CORS failure: ${error.message}. The provider may not allow browser requests from this origin.`
  }
  if (error instanceof Error) return error.message
  return String(error)
}

/** Exposed so the droid can report and reset what it is holding. */
export function cacheSize(): number {
  return cache.size
}

export function clearCache(): void {
  const held = cache.size
  cache.clear()
  record({
    kind: 'cache',
    headline: 'Memory cleared.',
    detail: `${held} cached desk${held === 1 ? '' : 's'} released. The next request will hit the network.`,
  })
}
