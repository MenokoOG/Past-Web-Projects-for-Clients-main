# Use cases — the NB-3O protocol droid

**System:** News Bonners Ferry, modernized
**Legacy build:** `../` — Dreamweaver, XHTML 1.0 Transitional, 2012
**Modern build:** `newsbf-modern/` — TypeScript, React, Tailwind, mobile-first
**Live content:** free news APIs, keyless by default

---

## 0. Context

The 2012 site is a working local newspaper for Boundary County, Idaho. It is also
a catalogue of the era it was built in: a 1000px fixed canvas, three floated
columns cleared by hand, no viewport meta tag, editable regions belonging to a
content management service that no longer exists, article text typed directly
into duplicated HTML templates, and analytics tags that stopped collecting years
ago.

Rewriting it is easy. Rewriting it in a way that a publisher can *see*, *check*
and *believe* is the harder problem, and it is the reason for the droid.

**NB-3O** is a protocol droid in the literal sense: it sits at the boundary
between vocabularies and translates. It does that in two directions at once.

| Direction | What it translates |
| --- | --- |
| **Historical** | The 2012 build's idioms → their modern equivalents, itemized in a ledger of 16 audited findings. |
| **Live** | Any upstream news provider's wire format → the newsroom's own `Article` shape, narrated in real time. |

Those are the same act. Both are the job of an interface that speaks two
languages and refuses to let either one leak into the other.

---

## 1. Actors

| Actor | Description |
| --- | --- |
| **Reader** | Someone in Boundary County who wants to know what happened. Increasingly on a phone. |
| **Publisher / stakeholder** | The person who paid for the rebuild and needs to understand what they bought. |
| **Developer / evaluator** | Someone assessing whether the architecture is genuinely modular or merely described as such. |
| **NB-3O (system)** | The protocol droid. Initiates the translation and fallback flows itself. |
| **News provider** | An external actor: The Guardian, Spaceflight News, Hacker News, GNews, NewsAPI. |

---

## 2. Use case index

| ID | Title | Primary actor |
| --- | --- | --- |
| [UC-01](#uc-01--read-the-paper-on-a-phone) | Read the paper on a phone | Reader |
| [UC-02](#uc-02--explain-the-modernization) | Explain the modernization to whoever is paying for it | Publisher |
| [UC-03](#uc-03--translate-a-foreign-wire) | Translate a foreign wire into the house format | NB-3O |
| [UC-04](#uc-04--swap-the-news-source-at-runtime) | Swap the news source while the page is open | Developer |
| [UC-05](#uc-05--survive-an-upstream-failure) | Survive an upstream failure without going blank | NB-3O |

> These five are also encoded as data in
> [`src/droid/useCases.ts`](../src/droid/useCases.ts) and rendered by the
> in-app **About this rebuild** page. A specification that lives only in a
> separate document drifts from the build within a release or two; this one is
> published by the product it specifies.

---

## UC-01 — Read the paper on a phone

**Primary actor:** Reader
**Goal:** Find out what happened locally, on the device actually in their hand.

**Preconditions**

- The reader opens the site on a viewport narrower than 1000px.
- At least one news protocol is reachable.

**Main flow**

1. The masthead, desk navigation and story feed render in a single column.
2. NB-3O requests the front desk from the active provider on the reader's behalf.
3. Skeleton cards hold the layout so nothing shifts as stories arrive.
4. Stories render lead-first, with images sized by ratio rather than fixed pixels.
5. The reader taps a desk in the navigation; the feed reloads with no document navigation.

**Alternate flows**

- **A1** — A story has no image, or its image fails to load →
  the card reflows into its text-only form instead of showing a broken icon.
- **A2** — The desk was read within the last five minutes →
  it is served from memory and no network request is made.

**Postconditions**

- The reader has read the paper without pinching, zooming or scrolling sideways.
- No third-party tracker has run.

**Verification**

At a 375px viewport, `document.documentElement.scrollWidth` equals
`clientWidth`. The only elements extending past the viewport are the desk
navigation's list items, which live inside a deliberately horizontally
scrollable strip.

**Why it justifies the work**

The 2012 build had no viewport tag and a 1000px fixed canvas, so it arrived on a
phone zoomed out to illegibility. This is the use case the rebuild exists for;
everything else is consequence.

---

## UC-02 — Explain the modernization

**Primary actor:** Publisher or stakeholder
**Goal:** Understand what changed, where, and why it was worth doing.

**Preconditions**

- The droid panel is reachable from any page.

**Main flow**

1. The stakeholder opens NB-3O and lands on the **Ledger** tab.
2. The droid lists all 16 findings from the audit of the legacy build.
3. The stakeholder filters by area — layout, accessibility, analytics, and so on.
4. Expanding a finding shows: the legacy behaviour, its file, the replacement,
   its file, and the rationale in plain language.

**Alternate flows**

- **A1** — The stakeholder would rather see the problem than read about it →
  the **Protocols** tab overlays the old 1000px canvas on the live page and
  reports how far it overflows the current viewport in pixels.

**Postconditions**

- The rebuild is defensible line by line rather than as a matter of taste.

**Ledger coverage**

| Area | Findings |
| --- | --- |
| Markup | 3 |
| Layout | 3 |
| Accessibility | 3 |
| Content | 3 |
| Styling | 2 |
| Data | 1 |
| Analytics | 1 |

Source of truth: [`src/droid/ledger.ts`](../src/droid/ledger.ts).

**Why it justifies the work**

A rewrite that cannot be explained is indistinguishable from a redesign for its
own sake. The ledger turns the work into an itemized account.

---

## UC-03 — Translate a foreign wire

**Primary actor:** NB-3O (system)
**Goal:** Turn any upstream provider's payload into the newsroom's own `Article` shape.

**Preconditions**

- A provider is selected and reports itself available.
- The reader has requested a desk.

**Main flow**

1. The droid opens a channel to the provider and logs the **handshake**.
2. It maps the desk name onto that provider's vocabulary and logs the
   **translation**, marking it `Native` or `Translated`.
3. The response is normalized — markup stripped from titles and summaries,
   images forced to https, dates converted to ISO-8601, bylines flattened.
4. The result is cached under `provider:desk:pageSize` and returned to the view.

**Alternate flows**

- **A1** — The provider has no equivalent of the requested desk →
  the droid rewrites the desk as a keyword query and labels the result
  `Translated` rather than `Native`, so the approximation is visible instead of
  silent.
- **A2** — The provider carries no summaries or images at all, as Hacker News
  does → the droid synthesizes a summary from the available metadata and the
  card degrades to its text-only form.

**Postconditions**

- The view layer has never seen a vendor field name.
- Adding a sixth provider requires one new file and one registry entry.

**Worked example — the Obituaries desk**

| Provider | Fidelity | Query the droid actually sends |
| --- | --- | --- |
| The Guardian | `Native` | `tag=tone/obituaries` |
| Spaceflight News | `Translated` | `search=memorial` |
| Hacker News | `Translated` | `query=in memoriam` |
| GNews | `Translated` | `q=obituary` |
| NewsAPI | `Translated` | `everything?q=obituary` |

Observed transmission log, switching to Hacker News on that desk:

```
HANDSHAKE   Switching protocol to Hacker News.
            The Guardian → Hacker News. The reading experience does not
            change; only the dialect behind it does.
HANDSHAKE   Opening a channel to Hacker News.
            Requesting the Obituaries desk, 12 items.
TRANSLATE   Translating "Obituaries" into a dialect Hacker News understands.
            no desks upstream — rewritten as search "in memoriam"
COMPLETE    12 articles translated into the house format.            379ms
            Hacker News → Article[]. Fields normalized: title, summary,
            byline, image, published date.
```

**Why it justifies the work**

This seam is what a protocol droid is *for*. It is also precisely what the
legacy build lacked: article text was typed straight into HTML, so there was no
boundary at which a source could be changed.

---

## UC-04 — Swap the news source at runtime

**Primary actor:** Developer or evaluator
**Goal:** Prove the data layer is genuinely decoupled from the presentation.

**Preconditions**

- At least two providers report themselves available.

**Main flow**

1. The evaluator opens the **Protocols** tab and reads each provider's fidelity
   for the current desk.
2. They select a different provider.
3. Every mounted view re-requests its desk through the new protocol.
4. The page re-renders with different content and identical layout, and the
   choice is remembered for the next visit.

**Alternate flows**

- **A1** — The provider requires an API key that is not configured → it is
  listed as unavailable with the exact environment variable to set, and cannot
  be selected.
- **A2** — The provider is keyed but the origin is not localhost, as on the free
  NewsAPI plan → the droid reports the origin restriction up front rather than
  letting it surface as an opaque CORS failure after deployment.

**Postconditions**

- The same components have rendered five different wire formats.

**Why it justifies the work**

A claim that a system is modular is worth less than a control that demonstrates
it in front of the person asking.

---

## UC-05 — Survive an upstream failure

**Primary actor:** NB-3O (system)
**Goal:** Keep the desks filled when a provider stops answering.

**Preconditions**

- A request has failed, timed out, or returned an error envelope.

**Main flow**

1. The droid records the **fault**, with the provider, the desk and elapsed time.
2. It selects the next reachable keyless provider.
3. It retries the same desk through that provider and logs the substitution.
4. The page states which source actually answered.

**Alternate flows**

- **A1** — No provider is reachable at all → the desk shows an explicit error
  with a retry control, rather than an empty page that looks like a bug.
- **A2** — The reader navigates away mid-request → the request is aborted and
  nothing is logged, so the log never reports completions for pages the reader
  has already left.

**Postconditions**

- A single upstream outage never produces an empty newspaper.

**Why it justifies the work**

Local papers are read at fixed times of day. Degrading to a different wire
service is always better than degrading to nothing.

---

## 3. Non-goals

Stated explicitly, so the scope of the demonstration is not mistaken for the
scope of a production newspaper.

- **This does not publish Boundary County's own journalism.** The free APIs
  supply real, live articles to prove the data layer; they are not a substitute
  for the newsroom's copy. A production deployment would point the same
  `NewsProvider` interface at the paper's own CMS.
- **The advertising inventory is not reproduced.** The legacy build hard-coded
  roughly twenty local advertisers as fixed-size images. Ad serving is a
  separate concern from modernizing the reading experience.
- **No article archive is migrated.** The rebuild replaces the templates; moving
  a decade of stories out of hand-edited HTML is its own project.

---

## 4. Traceability

| Use case | Primary implementation |
| --- | --- |
| UC-01 | [`PageShell.tsx`](../src/components/PageShell.tsx), [`ArticleGrid.tsx`](../src/components/ArticleGrid.tsx), [`ArticleCard.tsx`](../src/components/ArticleCard.tsx), [`index.css`](../src/index.css) |
| UC-02 | [`ledger.ts`](../src/droid/ledger.ts), [`LedgerTab.tsx`](../src/droid/LedgerTab.tsx), [`LegacyGuide.tsx`](../src/droid/LegacyGuide.tsx) |
| UC-03 | [`client.ts`](../src/news/client.ts), [`providers/`](../src/news/providers/), [`log.ts`](../src/droid/log.ts) |
| UC-04 | [`registry.ts`](../src/news/registry.ts), [`ProtocolsTab.tsx`](../src/droid/ProtocolsTab.tsx), [`DroidContext.tsx`](../src/droid/DroidContext.tsx) |
| UC-05 | [`client.ts`](../src/news/client.ts) — `fallback()`, [`useArticles.ts`](../src/hooks/useArticles.ts) |
