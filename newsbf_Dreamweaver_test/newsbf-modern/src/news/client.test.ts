import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Article } from './types'
import { NewsProviderError } from './types'
import { clearCache, fetchSection } from './client'
import { spaceflightProvider } from './providers/spaceflight'
import { hackerNewsProvider } from './providers/hackernews'
import { guardianProvider } from './providers/guardian'

const offline = () => Promise.reject(new TypeError('Failed to fetch'))

const story: Article = {
  id: 'hackernews:1',
  title: 'A story',
  summary: '',
  url: 'https://example.com/',
  imageUrl: null,
  byline: null,
  publishedAt: '2026-01-01T00:00:00.000Z',
  source: 'Hacker News',
  sectionId: 'front',
  providerId: 'hackernews',
}

describe('fetchSection fallback', () => {
  beforeEach(() => {
    clearCache()
    // No Guardian key in tests, so only the two keyless providers are candidates.
    vi.spyOn(guardianProvider, 'unavailableReason').mockReturnValue('no key in tests')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('gives up with a clear error when every keyless provider fails', async () => {
    // Fail the first few calls, then answer, so a regression ends as a failed
    // assertion instead of a test run that never finishes.
    let calls = 0
    const offlineThenRecover = () => (++calls > 4 ? Promise.resolve([]) : offline())
    const spaceflight = vi
      .spyOn(spaceflightProvider, 'fetchSection')
      .mockImplementation(offlineThenRecover)
    const hackerNews = vi
      .spyOn(hackerNewsProvider, 'fetchSection')
      .mockImplementation(offlineThenRecover)

    await expect(fetchSection('front')).rejects.toBeInstanceOf(NewsProviderError)

    // Each provider is tried exactly once; before the fix they handed the
    // request back and forth forever.
    expect(spaceflight).toHaveBeenCalledTimes(1)
    expect(hackerNews).toHaveBeenCalledTimes(1)
  })

  it('falls back to the next provider and reports which one failed', async () => {
    vi.spyOn(spaceflightProvider, 'fetchSection').mockImplementation(offline)
    vi.spyOn(hackerNewsProvider, 'fetchSection').mockResolvedValue([story])

    const result = await fetchSection('front')

    expect(result.providerId).toBe('hackernews')
    expect(result.fellBackFrom).toBe('spaceflight')
    expect(result.articles).toEqual([story])
  })
})
