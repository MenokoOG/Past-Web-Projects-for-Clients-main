import type { Article, Fidelity, NewsProvider, ProviderRequest, SectionId } from '../types'
import { NewsProviderError } from '../types'
import { secureUrl, stripHtml, truncate } from '@/lib/text'

/**
 * GNews.io — free tier, 100 requests/day, but it requires registration.
 *
 * Registered here to prove the registry handles *conditional* providers: the
 * droid reports it as unavailable, with an actionable reason, until a key
 * appears in the environment. No key, no broken UI.
 */
const HEADLINES = 'https://gnews.io/api/v4/top-headlines'
const SEARCH = 'https://gnews.io/api/v4/search'

type Desk =
  | { readonly kind: 'category'; readonly value: string; readonly fidelity: Fidelity }
  | { readonly kind: 'search'; readonly value: string; readonly fidelity: Fidelity }

const DESKS: Readonly<Record<SectionId, Desk>> = {
  front: { kind: 'category', value: 'general', fidelity: 'native' },
  news: { kind: 'category', value: 'nation', fidelity: 'native' },
  sports: { kind: 'category', value: 'sports', fidelity: 'native' },
  events: { kind: 'category', value: 'entertainment', fidelity: 'translated' },
  obituaries: { kind: 'search', value: 'obituary', fidelity: 'translated' },
  social: { kind: 'category', value: 'health', fidelity: 'translated' },
  letters: { kind: 'search', value: 'opinion editorial', fidelity: 'translated' },
}

interface GNewsArticle {
  readonly title: string
  readonly description?: string | null
  readonly content?: string | null
  readonly url: string
  readonly image?: string | null
  readonly publishedAt: string
  readonly source?: { readonly name?: string }
}

interface GNewsEnvelope {
  readonly articles?: readonly GNewsArticle[]
  readonly errors?: readonly string[]
}

function apiKey(): string {
  return ((import.meta.env.VITE_GNEWS_API_KEY as string | undefined) ?? '').trim()
}

export const gnewsProvider: NewsProvider = {
  id: 'gnews',
  label: 'GNews',
  homepage: 'https://gnews.io/',
  keyless: false,

  unavailableReason: () =>
    apiKey() ? null : 'Set VITE_GNEWS_API_KEY in .env.local — free tier at gnews.io.',

  fidelity: (sectionId) => (apiKey() ? DESKS[sectionId].fidelity : 'unsupported'),

  describeQuery: (sectionId) => {
    const desk = DESKS[sectionId]
    return desk.kind === 'category'
      ? `category = ${desk.value}`
      : `no matching category — rewritten as search ${desk.value}`
  },

  async fetchSection({ sectionId, limit, signal }: ProviderRequest) {
    const key = apiKey()
    if (!key) throw new NewsProviderError('gnews', 'GNews API key is not configured')

    const desk = DESKS[sectionId]
    const url = new URL(desk.kind === 'category' ? HEADLINES : SEARCH)
    url.searchParams.set('apikey', key)
    url.searchParams.set('lang', 'en')
    url.searchParams.set('max', String(Math.min(limit, 10)))
    url.searchParams.set(desk.kind === 'category' ? 'category' : 'q', desk.value)

    const response = await fetch(url, { signal })
    const payload = (await response.json().catch(() => ({}))) as GNewsEnvelope
    if (!response.ok) {
      throw new NewsProviderError(
        'gnews',
        payload.errors?.join('; ') ?? `GNews responded ${response.status}`,
      )
    }

    return (payload.articles ?? []).map(
      (article, index): Article => ({
        id: `gnews:${article.url || index}`,
        title: stripHtml(article.title),
        summary: truncate(stripHtml(article.description ?? article.content ?? ''), 260),
        url: article.url,
        imageUrl: secureUrl(article.image),
        byline: null,
        publishedAt: article.publishedAt,
        source: article.source?.name ?? 'GNews',
        sectionId,
        providerId: 'gnews',
      }),
    )
  },
}
