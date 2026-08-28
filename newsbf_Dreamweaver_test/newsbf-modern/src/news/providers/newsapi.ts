import type { Article, Fidelity, NewsProvider, ProviderRequest, SectionId } from '../types'
import { NewsProviderError } from '../types'
import { secureUrl, stripHtml, truncate } from '@/lib/text'

/**
 * NewsAPI.org — free developer plan.
 *
 * Note the deployment caveat baked into `unavailableReason`: the free plan
 * refuses browser requests from any origin except localhost. Surfacing that in
 * the droid protocol tab is cheaper than letting a developer discover it as an
 * opaque CORS failure after deploying.
 */
const HEADLINES = 'https://newsapi.org/v2/top-headlines'
const EVERYTHING = 'https://newsapi.org/v2/everything'

type Desk =
  | { readonly kind: 'category'; readonly value: string; readonly fidelity: Fidelity }
  | { readonly kind: 'search'; readonly value: string; readonly fidelity: Fidelity }

const DESKS: Readonly<Record<SectionId, Desk>> = {
  front: { kind: 'category', value: 'general', fidelity: 'native' },
  news: { kind: 'category', value: 'general', fidelity: 'native' },
  sports: { kind: 'category', value: 'sports', fidelity: 'native' },
  events: { kind: 'category', value: 'entertainment', fidelity: 'translated' },
  obituaries: { kind: 'search', value: 'obituary', fidelity: 'translated' },
  social: { kind: 'category', value: 'health', fidelity: 'translated' },
  letters: { kind: 'search', value: 'letters to the editor', fidelity: 'translated' },
}

interface NewsApiArticle {
  readonly title?: string | null
  readonly description?: string | null
  readonly url: string
  readonly urlToImage?: string | null
  readonly publishedAt: string
  readonly author?: string | null
  readonly source?: { readonly name?: string }
}

interface NewsApiEnvelope {
  readonly status?: string
  readonly message?: string
  readonly articles?: readonly NewsApiArticle[]
}

function apiKey(): string {
  return ((import.meta.env.VITE_NEWSAPI_KEY as string | undefined) ?? '').trim()
}

function blockedReason(): string | null {
  if (!apiKey()) {
    return 'Set VITE_NEWSAPI_KEY in .env.local — free developer plan at newsapi.org.'
  }
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') return null
  return 'The free NewsAPI plan blocks browser requests from non-localhost origins.'
}

export const newsApiProvider: NewsProvider = {
  id: 'newsapi',
  label: 'NewsAPI.org',
  homepage: 'https://newsapi.org/',
  keyless: false,

  unavailableReason: blockedReason,

  fidelity: (sectionId) => (blockedReason() ? 'unsupported' : DESKS[sectionId].fidelity),

  describeQuery: (sectionId) => {
    const desk = DESKS[sectionId]
    return desk.kind === 'category'
      ? `top-headlines, country = us, category = ${desk.value}`
      : `no matching category — rewritten as everything?q=${desk.value}`
  },

  async fetchSection({ sectionId, limit, signal }: ProviderRequest) {
    const key = apiKey()
    if (!key) throw new NewsProviderError('newsapi', 'NewsAPI key is not configured')

    const desk = DESKS[sectionId]
    const url = new URL(desk.kind === 'category' ? HEADLINES : EVERYTHING)
    url.searchParams.set('pageSize', String(limit))
    if (desk.kind === 'category') {
      url.searchParams.set('country', 'us')
      url.searchParams.set('category', desk.value)
    } else {
      url.searchParams.set('q', desk.value)
      url.searchParams.set('language', 'en')
      url.searchParams.set('sortBy', 'publishedAt')
    }

    // Sent as a header rather than a query param so the key stays out of
    // referrer logs and browser history.
    const response = await fetch(url, { signal, headers: { 'X-Api-Key': key } })
    const payload = (await response.json().catch(() => ({}))) as NewsApiEnvelope
    if (!response.ok || payload.status === 'error') {
      throw new NewsProviderError(
        'newsapi',
        payload.message ?? `NewsAPI responded ${response.status}`,
      )
    }

    return (payload.articles ?? [])
      .filter((article) => article.title && article.title !== '[Removed]')
      .map(
        (article, index): Article => ({
          id: `newsapi:${article.url || index}`,
          title: stripHtml(article.title ?? ''),
          summary: truncate(stripHtml(article.description ?? ''), 260),
          url: article.url,
          imageUrl: secureUrl(article.urlToImage),
          byline: article.author ? stripHtml(article.author) : null,
          publishedAt: article.publishedAt,
          source: article.source?.name ?? 'NewsAPI',
          sectionId,
          providerId: 'newsapi',
        }),
      )
  },
}
