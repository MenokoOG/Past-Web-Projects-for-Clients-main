/**
 * The use cases the protocol droid exists to satisfy.
 *
 * These are kept as data, in the application itself, for the same reason the
 * translation ledger is: a specification that lives in a separate document
 * drifts from the build within a release or two. The About page renders these
 * verbatim, so the stated behaviour and the shipped behaviour are edited in
 * one place.
 */
export interface UseCase {
  readonly id: string
  readonly title: string
  /** Who initiates it. */
  readonly actor: string
  /** What they are trying to achieve. */
  readonly goal: string
  readonly preconditions: readonly string[]
  /** The happy path, in order. */
  readonly mainFlow: readonly string[]
  readonly alternateFlows: readonly { readonly when: string; readonly then: string }[]
  readonly postconditions: readonly string[]
  /** Why this use case justifies the work. */
  readonly value: string
}

export const USE_CASES: readonly UseCase[] = [
  {
    id: 'UC-01',
    title: 'Read the paper on a phone',
    actor: 'Reader in Boundary County',
    goal: 'Find out what happened locally, on the device actually in their hand.',
    preconditions: [
      'The reader opens the site on a viewport narrower than 1000px.',
      'At least one news protocol is reachable.',
    ],
    mainFlow: [
      'The masthead, desk navigation and story feed render in a single column.',
      'The droid requests the front desk from the active provider on the reader’s behalf.',
      'Skeleton cards hold the layout so nothing shifts as stories arrive.',
      'Stories render lead-first, with images sized by ratio rather than fixed pixels.',
      'The reader taps a desk in the navigation; the feed reloads without a document navigation.',
    ],
    alternateFlows: [
      {
        when: 'A story has no image, or its image fails to load.',
        then: 'The card reflows into its text-only form instead of showing a broken icon.',
      },
      {
        when: 'The desk was read within the last five minutes.',
        then: 'It is served from memory and no network request is made.',
      },
    ],
    postconditions: [
      'The reader has read the paper without pinching, zooming or scrolling sideways.',
      'No third-party tracker has run.',
    ],
    value:
      'The 2012 build had no viewport tag and a 1000px fixed canvas, so it arrived on a phone zoomed out to illegibility. This is the use case the rebuild exists to fix.',
  },
  {
    id: 'UC-02',
    title: 'Explain the modernization to whoever is paying for it',
    actor: 'Publisher or stakeholder',
    goal: 'Understand what changed, where, and why it was worth doing.',
    preconditions: ['The droid panel is reachable from any page.'],
    mainFlow: [
      'The stakeholder opens NB-3O and lands on the Ledger tab.',
      'The droid lists every finding from the audit of the legacy build.',
      'The stakeholder filters by area — layout, accessibility, analytics, and so on.',
      'Expanding a finding shows the legacy behaviour, its file, the replacement, its file, and the rationale in plain language.',
    ],
    alternateFlows: [
      {
        when: 'The stakeholder wants to see the problem rather than read about it.',
        then: 'The Protocols tab overlays the old 1000px canvas on the live page, and reports how far it overflows the current viewport.',
      },
    ],
    postconditions: [
      'The rebuild is defensible line by line rather than as a matter of taste.',
    ],
    value:
      'A rewrite that cannot be explained is indistinguishable from a redesign for its own sake. The ledger turns the work into an itemized account.',
  },
  {
    id: 'UC-03',
    title: 'Translate a foreign wire into the house format',
    actor: 'NB-3O (system)',
    goal: 'Turn any upstream provider’s payload into the newsroom’s own Article shape.',
    preconditions: [
      'A provider is selected and reports itself available.',
      'The reader has requested a desk.',
    ],
    mainFlow: [
      'The droid opens a channel to the provider and logs the handshake.',
      'It maps the desk name onto that provider’s vocabulary and logs the translation, marking it native or approximated.',
      'The response is normalized: titles and summaries stripped of markup, images forced to https, dates converted to ISO-8601, bylines flattened.',
      'The result is cached under provider, desk and page size, and returned to the view.',
    ],
    alternateFlows: [
      {
        when: 'The provider has no equivalent of the requested desk.',
        then: 'The droid rewrites the desk as a keyword query and labels the result Translated rather than Native, so the approximation is visible instead of silent.',
      },
      {
        when: 'The provider carries no summaries or images at all, as Hacker News does.',
        then: 'The droid synthesizes a summary from the available metadata and the card degrades to its text-only form.',
      },
    ],
    postconditions: [
      'The view layer has never seen a vendor field name.',
      'Adding a sixth provider requires one new file and one registry entry.',
    ],
    value:
      'This seam is what a protocol droid is for. It is also the thing the legacy build lacked entirely: article text was typed straight into HTML, so there was no boundary at which a source could be changed.',
  },
  {
    id: 'UC-04',
    title: 'Swap the news source while the page is open',
    actor: 'Developer or evaluator',
    goal: 'Prove the data layer is genuinely decoupled from the presentation.',
    preconditions: ['At least two providers report themselves available.'],
    mainFlow: [
      'The evaluator opens the Protocols tab and reads each provider’s fidelity for the current desk.',
      'They select a different provider.',
      'Every mounted view re-requests its desk through the new protocol.',
      'The page re-renders with different content and identical layout, and the choice is remembered for the next visit.',
    ],
    alternateFlows: [
      {
        when: 'The provider requires an API key that is not configured.',
        then: 'It is listed as unavailable with the exact environment variable to set, and cannot be selected.',
      },
      {
        when: 'The provider is keyed but the current origin is not localhost, as on the free NewsAPI plan.',
        then: 'The droid reports the origin restriction up front rather than letting it surface as an opaque CORS failure.',
      },
    ],
    postconditions: ['The same components have rendered five different wire formats.'],
    value:
      'A claim that a system is modular is worth less than a control that demonstrates it in front of the person asking.',
  },
  {
    id: 'UC-05',
    title: 'Survive an upstream failure without going blank',
    actor: 'NB-3O (system)',
    goal: 'Keep the desks filled when a provider stops answering.',
    preconditions: ['A request has failed, timed out, or returned an error envelope.'],
    mainFlow: [
      'The droid records the fault, with the provider, the desk and the elapsed time.',
      'It selects the next reachable keyless provider.',
      'It retries the same desk through that provider and logs the substitution.',
      'The page states which source actually answered.',
    ],
    alternateFlows: [
      {
        when: 'No provider is reachable at all.',
        then: 'The desk shows an explicit error with a retry control, rather than an empty page that looks like a bug.',
      },
      {
        when: 'The reader navigates away mid-request.',
        then: 'The request is aborted and nothing is logged, so the transmission log never reports completions for pages the reader has left.',
      },
    ],
    postconditions: ['A single upstream outage never produces an empty newspaper.'],
    value:
      'Local papers are read at fixed times of day. Degrading to a different wire service is always better than degrading to nothing.',
  },
]
