import { useCallback, useEffect, useState } from 'react'
import type { Article, ProviderId, SectionId } from '@/news/types'
import { fetchSection } from '@/news/client'

export type ArticlesStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface ArticlesState {
  readonly status: ArticlesStatus
  readonly articles: readonly Article[]
  readonly error: string | null
  readonly fromCache: boolean
  /** Set when the requested provider failed and another one answered. */
  readonly servedBy: ProviderId | null
  readonly refresh: () => void
}

/**
 * Loads one desk and keeps the request tied to the component's lifetime.
 *
 * Aborting on unmount matters here because the droid narrates every exchange:
 * without it, clicking quickly through desks would leave the transmission log
 * reporting completions for pages the reader has already left.
 */
export function useArticles(sectionId: SectionId, providerId: ProviderId): ArticlesState {
  const [status, setStatus] = useState<ArticlesStatus>('idle')
  const [articles, setArticles] = useState<readonly Article[]>([])
  const [error, setError] = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)
  const [servedBy, setServedBy] = useState<ProviderId | null>(null)
  const [nonce, setNonce] = useState(0)

  const refresh = useCallback(() => {
    setNonce((value) => value + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    setStatus('loading')
    setError(null)

    fetchSection(sectionId, {
      providerId,
      signal: controller.signal,
      force: nonce > 0,
    })
      .then((result) => {
        if (cancelled) return
        setArticles(result.articles)
        setFromCache(result.fromCache)
        setServedBy(result.providerId)
        setStatus('ready')
      })
      .catch((cause: unknown) => {
        if (cancelled || controller.signal.aborted) return
        setError(cause instanceof Error ? cause.message : String(cause))
        setStatus('error')
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [sectionId, providerId, nonce])

  return { status, articles, error, fromCache, servedBy, refresh }
}
