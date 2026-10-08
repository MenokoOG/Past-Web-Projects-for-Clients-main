import type {
  Article,
  Fidelity,
  NewsProvider,
  ProviderRequest,
  SectionId,
} from '../types'
import { NewsProviderError } from '../types'
import { secureUrl, stripHtml, truncate } from '@/lib/text'

/**
 * The Guardian Open Platform.
 *
 * Needs a free developer key (VITE_GUARDIAN_API_KEY, register at
 * https://open-platform.theguardian.com/access/). It used to be the keyless
 * default via the documented public `test` key, but that key now answers
 * 401 Unauthorized. A 401 carries no CORS headers, so in a browser it showed up
 * as a misleading CORS error, and the droid silently fell back on every load.
 * Without a key this provider reports itself unavailable, with the fix stated,
 * instead of making a request that is certain to fail.
 */
const ENDPOINT = 'https://content.guardianapis.com/search'

/** How each of the newsroom's desks is expressed in The Guardian's own terms. */
interface DeskMapping {
  readonly params: Readonly<Record<string, string>>
  readonly fidelity: Fidelity
  readonly rationale: string
}

const DESKS: Readonly<Record<SectionId, DeskMapping>> = {
  front: {
    params: {},
    fidelity: 'native',
    rationale: 'newest across every section, the front page',
  },
  news: {
    params: { section: 'us-news|world' },
    fidelity: 'native',
    rationale: 'section = us-news | world',
  },
  sports: {
    params: { section: 'sport' },
    fidelity: 'native',
    rationale: 'section = sport',
  },
  events: {
    params: { section: 'culture' },
    fidelity: 'translated',
    rationale: 'no events desk upstream, approximated by section = culture',
  },
  obituaries: {
    params: { tag: 'tone/obituaries' },
    fidelity: 'native',
    rationale: 'tag = tone/obituaries',
  },
  social: {
    params: { section: 'lifeandstyle' },
    fidelity: 'translated',
    rationale: 'no social desk upstream, approximated by section = lifeandstyle',
  },
  letters: {
    params: { section: 'commentisfree' },
    fidelity: 'translated',
    rationale: 'no letters desk upstream, approximated by section = commentisfree',
  },
}

interface GuardianFields {
  readonly trailText?: string
  readonly byline?: string
  readonly thumbnail?: string
  readonly bodyText?: string
}

interface GuardianResult {
  readonly id: string
  readonly webTitle: string
  readonly webUrl: string
  readonly webPublicationDate: string
  readonly sectionName?: string
  readonly fields?: GuardianFields
}

interface GuardianEnvelope {
  readonly response?: {
    readonly status?: string
    readonly message?: string
    readonly results?: readonly GuardianResult[]
  }
}

function apiKey(): string {
  const configured = import.meta.env.VITE_GUARDIAN_API_KEY as string | undefined
  return configured?.trim() ?? ''
}

export const guardianProvider: NewsProvider = {
  id: 'guardian',
  label: 'The Guardian',
  homepage: 'https://open-platform.theguardian.com/',
  keyless: false,

  unavailableReason: () =>
    apiKey()
      ? null
      : 'Set VITE_GUARDIAN_API_KEY in .env.local. Free developer key at open-platform.theguardian.com.',

  fidelity: (sectionId) => (apiKey() ? DESKS[sectionId].fidelity : 'unsupported'),

  describeQuery: (sectionId) => DESKS[sectionId].rationale,

  async fetchSection({ sectionId, limit, signal }: ProviderRequest) {
    const url = new URL(ENDPOINT)
    url.searchParams.set('api-key', apiKey())
    url.searchParams.set('page-size', String(limit))
    url.searchParams.set('order-by', 'newest')
    url.searchParams.set('show-fields', 'trailText,byline,thumbnail,bodyText')
    for (const [key, value] of Object.entries(DESKS[sectionId].params)) {
      url.searchParams.set(key, value)
    }

    const response = await fetch(url, { signal })
    if (!response.ok) {
      throw new NewsProviderError(
        'guardian',
        `The Guardian responded ${response.status} ${response.statusText}`,
      )
    }

    const payload = (await response.json()) as GuardianEnvelope
    if (payload.response?.status !== 'ok') {
      throw new NewsProviderError(
        'guardian',
        payload.response?.message ?? 'The Guardian returned an error envelope',
      )
    }

    return (payload.response.results ?? []).map(
      (result): Article => ({
        id: `guardian:${result.id}`,
        title: stripHtml(result.webTitle),
        summary: truncate(
          stripHtml(result.fields?.trailText ?? result.fields?.bodyText ?? ''),
          260,
        ),
        url: result.webUrl,
        imageUrl: secureUrl(result.fields?.thumbnail) ?? null,
        byline: result.fields?.byline ? stripHtml(result.fields.byline) : null,
        publishedAt: result.webPublicationDate,
        source: result.sectionName ? `The Guardian · ${result.sectionName}` : 'The Guardian',
        sectionId,
        providerId: 'guardian',
      }),
    )
  },
}
