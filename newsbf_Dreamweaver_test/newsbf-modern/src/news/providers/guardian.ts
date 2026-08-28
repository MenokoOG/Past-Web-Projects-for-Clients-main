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
 * Chosen as the default because it is the only general-interest wire service
 * with a genuinely keyless entry point: the documented public `test` key needs
 * no registration, so a fresh clone of this repo renders real news on the first
 * `npm run dev`. Supply VITE_GUARDIAN_API_KEY to lift the rate limit.
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
    rationale: 'newest across every section — the front page',
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
    rationale: 'no events desk upstream — approximated by section = culture',
  },
  obituaries: {
    params: { tag: 'tone/obituaries' },
    fidelity: 'native',
    rationale: 'tag = tone/obituaries',
  },
  social: {
    params: { section: 'lifeandstyle' },
    fidelity: 'translated',
    rationale: 'no social desk upstream — approximated by section = lifeandstyle',
  },
  letters: {
    params: { section: 'commentisfree' },
    fidelity: 'translated',
    rationale: 'no letters desk upstream — approximated by section = commentisfree',
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
  return configured?.trim() || 'test'
}

export const guardianProvider: NewsProvider = {
  id: 'guardian',
  label: 'The Guardian',
  homepage: 'https://open-platform.theguardian.com/',
  keyless: true,

  unavailableReason: () => null,

  fidelity: (sectionId) => DESKS[sectionId].fidelity,

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
