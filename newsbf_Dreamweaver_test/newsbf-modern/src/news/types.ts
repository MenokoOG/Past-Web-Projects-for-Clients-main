/**
 * The canonical wire format of the modernized newsroom.
 *
 * Every upstream provider speaks its own dialect (The Guardian returns
 * `webTitle`, Spaceflight News returns `title`, Hacker News returns `_tags`).
 * The protocol droid's job is to translate all of them into exactly this
 * shape, so the UI never learns a vendor's vocabulary.
 */
export interface Article {
  /** Stable, provider-namespaced id — safe as a React key and a route param. */
  readonly id: string
  readonly title: string
  /** Plain text. Providers that return HTML are sanitized during translation. */
  readonly summary: string
  readonly url: string
  readonly imageUrl: string | null
  readonly byline: string | null
  /** ISO-8601 UTC. Providers using epoch seconds are converted. */
  readonly publishedAt: string
  /** Human-readable origin, e.g. "The Guardian", "ESA". */
  readonly source: string
  readonly sectionId: SectionId
  readonly providerId: ProviderId
}

/**
 * The section vocabulary is inherited verbatim from the 2012 site's navigation
 * (`index.html` → `#menu ul li`). Modernizing the presentation must not break
 * the newsroom's own language for its desks.
 */
export const SECTION_IDS = [
  'front',
  'news',
  'sports',
  'events',
  'obituaries',
  'social',
  'letters',
] as const

export type SectionId = (typeof SECTION_IDS)[number]

export interface Section {
  readonly id: SectionId
  readonly label: string
  readonly blurb: string
  /** The legacy file this desk used to live in — shown in the droid's ledger. */
  readonly legacyPath: string
}

export type ProviderId = 'guardian' | 'spaceflight' | 'hackernews' | 'gnews' | 'newsapi'

/** How faithfully a provider can serve a given desk. */
export type Fidelity =
  /** The provider has a real, first-class equivalent of this desk. */
  | 'native'
  /** No equivalent desk; the droid rewrites it as a keyword query. */
  | 'translated'
  /** The provider cannot serve this desk at all. */
  | 'unsupported'

export interface ProviderRequest {
  readonly sectionId: SectionId
  readonly limit: number
  readonly signal: AbortSignal
}

export interface NewsProvider {
  readonly id: ProviderId
  readonly label: string
  /** Shown in the droid's protocol tab. */
  readonly homepage: string
  /** True when the provider works with no API key at all. */
  readonly keyless: boolean
  /** Why a keyed provider is unavailable, or null when it is ready to use. */
  unavailableReason(): string | null
  /** Declares, per desk, how well this provider can answer. */
  fidelity(sectionId: SectionId): Fidelity
  /** Describes the translation the droid will perform, for the log. */
  describeQuery(sectionId: SectionId): string
  fetchSection(request: ProviderRequest): Promise<readonly Article[]>
}

export class NewsProviderError extends Error {
  constructor(
    readonly providerId: ProviderId,
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'NewsProviderError'
  }
}
