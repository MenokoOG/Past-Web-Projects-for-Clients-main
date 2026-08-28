import type { Article, NewsProvider, ProviderRequest, SectionId } from '../types'
import { NewsProviderError } from '../types'
import { secureUrl, stripHtml, truncate } from '@/lib/text'

/**
 * Spaceflight News API v4 — keyless, CORS-open, and image-rich.
 *
 * It has no concept of desks at all, which makes it the useful stress case for
 * the droid: every section except the front page has to be rewritten as a
 * keyword search, and the UI must stay honest about that downgrade.
 */
const ENDPOINT = 'https://api.spaceflightnewsapi.net/v4/articles/'

const KEYWORDS: Readonly<Record<SectionId, string | null>> = {
  front: null,
  news: 'mission',
  sports: 'race',
  events: 'launch',
  obituaries: 'memorial',
  social: 'community',
  letters: 'opinion',
}

interface SpaceflightArticle {
  readonly id: number
  readonly title: string
  readonly url: string
  readonly image_url?: string | null
  readonly news_site?: string
  readonly summary?: string
  readonly published_at: string
  readonly authors?: readonly { readonly name?: string }[]
}

interface SpaceflightEnvelope {
  readonly results?: readonly SpaceflightArticle[]
}

export const spaceflightProvider: NewsProvider = {
  id: 'spaceflight',
  label: 'Spaceflight News',
  homepage: 'https://api.spaceflightnewsapi.net/',
  keyless: true,

  unavailableReason: () => null,

  fidelity: (sectionId) => (sectionId === 'front' ? 'native' : 'translated'),

  describeQuery: (sectionId) => {
    const keyword = KEYWORDS[sectionId]
    return keyword === null
      ? 'newest articles, unfiltered'
      : `no desks upstream — rewritten as search "${keyword}"`
  },

  async fetchSection({ sectionId, limit, signal }: ProviderRequest) {
    const url = new URL(ENDPOINT)
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('ordering', '-published_at')
    const keyword = KEYWORDS[sectionId]
    if (keyword !== null) url.searchParams.set('search', keyword)

    const response = await fetch(url, { signal })
    if (!response.ok) {
      throw new NewsProviderError(
        'spaceflight',
        `Spaceflight News responded ${response.status} ${response.statusText}`,
      )
    }

    const payload = (await response.json()) as SpaceflightEnvelope
    return (payload.results ?? []).map((result): Article => {
      const author = result.authors?.[0]?.name
      return {
        id: `spaceflight:${result.id}`,
        title: stripHtml(result.title),
        summary: truncate(stripHtml(result.summary ?? ''), 260),
        url: result.url,
        imageUrl: secureUrl(result.image_url),
        byline: author ? stripHtml(author) : null,
        publishedAt: result.published_at,
        source: result.news_site ?? 'Spaceflight News',
        sectionId,
        providerId: 'spaceflight',
      }
    })
  },
}
