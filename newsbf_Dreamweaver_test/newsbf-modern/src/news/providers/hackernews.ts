import type { Article, NewsProvider, ProviderRequest, SectionId } from '../types'
import { NewsProviderError } from '../types'
import { stripHtml, truncate } from '@/lib/text'

/**
 * Hacker News via the Algolia search API — keyless and unauthenticated.
 *
 * Included deliberately as the *lossiest* provider in the registry: it carries
 * no images and no summaries. It proves the card layout degrades gracefully
 * when a protocol simply does not have a field the design would like.
 */
const SEARCH = 'https://hn.algolia.com/api/v1/search'
const FRONT = 'https://hn.algolia.com/api/v1/search_by_date'

const QUERIES: Readonly<Record<SectionId, string | null>> = {
  front: null,
  news: 'news',
  sports: 'sports',
  events: 'conference',
  obituaries: 'in memoriam',
  social: 'community',
  letters: 'ask hn',
}

interface AlgoliaHit {
  readonly objectID: string
  readonly title?: string | null
  readonly story_title?: string | null
  readonly url?: string | null
  readonly story_url?: string | null
  readonly author?: string
  readonly points?: number | null
  readonly num_comments?: number | null
  readonly created_at: string
}

interface AlgoliaEnvelope {
  readonly hits?: readonly AlgoliaHit[]
}

export const hackerNewsProvider: NewsProvider = {
  id: 'hackernews',
  label: 'Hacker News',
  homepage: 'https://hn.algolia.com/api',
  keyless: true,

  unavailableReason: () => null,

  fidelity: (sectionId) => (sectionId === 'front' ? 'native' : 'translated'),

  describeQuery: (sectionId) => {
    const query = QUERIES[sectionId]
    return query === null
      ? 'newest stories by date'
      : `no desks upstream — rewritten as search "${query}"`
  },

  async fetchSection({ sectionId, limit, signal }: ProviderRequest) {
    const query = QUERIES[sectionId]
    const url = new URL(query === null ? FRONT : SEARCH)
    url.searchParams.set('tags', 'story')
    url.searchParams.set('hitsPerPage', String(limit))
    if (query !== null) url.searchParams.set('query', query)

    const response = await fetch(url, { signal })
    if (!response.ok) {
      throw new NewsProviderError(
        'hackernews',
        `Hacker News responded ${response.status} ${response.statusText}`,
      )
    }

    const payload = (await response.json()) as AlgoliaEnvelope
    return (payload.hits ?? [])
      .filter((hit) => Boolean(hit.title ?? hit.story_title))
      .map((hit): Article => {
        const discussion = `https://news.ycombinator.com/item?id=${hit.objectID}`
        const points = hit.points ?? 0
        const comments = hit.num_comments ?? 0
        return {
          id: `hackernews:${hit.objectID}`,
          title: stripHtml(hit.title ?? hit.story_title ?? ''),
          // The protocol carries no abstract, so the droid synthesizes one
          // from the engagement metadata rather than rendering an empty card.
          summary: truncate(
            `${points} point${points === 1 ? '' : 's'} · ${comments} comment${
              comments === 1 ? '' : 's'
            } on Hacker News.`,
            260,
          ),
          url: hit.url ?? hit.story_url ?? discussion,
          imageUrl: null,
          byline: hit.author ?? null,
          publishedAt: hit.created_at,
          source: 'Hacker News',
          sectionId,
          providerId: 'hackernews',
        }
      })
  },
}
