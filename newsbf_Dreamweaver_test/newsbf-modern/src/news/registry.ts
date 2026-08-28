import type { NewsProvider, ProviderId } from './types'
import { guardianProvider } from './providers/guardian'
import { spaceflightProvider } from './providers/spaceflight'
import { hackerNewsProvider } from './providers/hackernews'
import { gnewsProvider } from './providers/gnews'
import { newsApiProvider } from './providers/newsapi'

/**
 * Every protocol the droid is fluent in, in preference order.
 *
 * Keyless providers come first so that a clone of this repository renders real
 * news with no configuration at all. Adding a sixth source means adding one
 * file and one entry here; nothing in the UI needs to know.
 */
export const PROVIDERS: readonly NewsProvider[] = [
  guardianProvider,
  spaceflightProvider,
  hackerNewsProvider,
  gnewsProvider,
  newsApiProvider,
]

export const DEFAULT_PROVIDER_ID: ProviderId = 'guardian'

const BY_ID = new Map<ProviderId, NewsProvider>(PROVIDERS.map((p) => [p.id, p]))

export function getProvider(id: ProviderId): NewsProvider {
  const provider = BY_ID.get(id)
  if (!provider) throw new Error(`Unknown news provider: ${id}`)
  return provider
}

export function isProviderId(value: string): value is ProviderId {
  return BY_ID.has(value as ProviderId)
}

/** Providers that can actually be called right now, keys and origin considered. */
export function availableProviders(): readonly NewsProvider[] {
  return PROVIDERS.filter((provider) => provider.unavailableReason() === null)
}
