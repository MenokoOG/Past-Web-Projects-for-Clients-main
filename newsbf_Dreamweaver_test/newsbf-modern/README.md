# News Bonners Ferry — modernized

A working rebuild of the 2012 Dreamweaver site in the parent directory, driven by
**NB-3O**, a protocol droid that translates the newsroom between formats — the
legacy build into a modern one, and any news API's wire format into the house
`Article` shape.

TypeScript · React 19 · Tailwind CSS v4 · Vite · mobile-first · live articles
from free news APIs · **no API key required to run it**.

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>. Real articles load immediately — the default
provider is The Guardian's Open Platform, reached through its documented public
`test` key.

---

## What NB-3O does

Open the droid from the button in the bottom-right corner. It has three tabs.

### Ledger

16 findings from the audit of the legacy build, filterable by area. Each one
shows what the 2012 site did, which file it lived in, what replaced it, where
the replacement lives, and why the change was worth making.

A sample of what is in there:

| Was | Now |
| --- | --- |
| No viewport meta tag — phones rendered the 1000px page zoomed out | `width=device-width`, with `viewport-fit=cover` |
| Three float columns at 175 / 490 / 270px, cleared by hand | CSS Grid collapsing to one column below `md` |
| Header, nav and footer pasted into 14 files | Three components rendered once from a route shell |
| `text-align: center` on `html, body, p, li` | Left-aligned measure capped at 68 characters |
| CushyCMS editable regions (the service is gone) | Typed `Article` records from a provider registry |
| `ga.js` + an eXTReMe Tracker `document.write` beacon | No third-party trackers |
| Copyright 2012 typed into every footer | Year computed at render time |

Source of truth: [`src/droid/ledger.ts`](src/droid/ledger.ts).

### Protocols

The five news APIs the droid speaks, each rated for how faithfully it can serve
the desk currently on screen:

- **Native** — the provider has a real equivalent of that desk.
- **Translated** — it does not, so the droid rewrites the desk as a keyword
  query and says so rather than pretending otherwise.
- **Unavailable** — a key is missing, or the origin is blocked, with the exact
  fix stated.

Selecting a different provider re-renders the whole paper through a different
wire format with no change to the layout. That is the demonstration.

This tab also overlays the legacy 1000px canvas on the live page and reports how
far it overflows the current viewport — resize the window with it on.

### Log

Every handshake, translation, cache hit, fault and fallback, as it happens.
Nothing here is scripted; each line is emitted by real code in
[`src/news/client.ts`](src/news/client.ts).

---

## The news providers

| Provider | Key | Notes |
| --- | --- | --- |
| **The Guardian** | none | Default. General news with real sections and images, via the public `test` key. |
| **Spaceflight News** | none | Keyless and image-rich, but has no desks at all — the stress case for translation. |
| **Hacker News** | none | The lossiest source: no images, no summaries. Proves the cards degrade gracefully. |
| **GNews** | `VITE_GNEWS_API_KEY` | Free tier, 100 requests/day. |
| **NewsAPI.org** | `VITE_NEWSAPI_KEY` | Free plan is localhost-only; the droid reports that restriction up front. |

To raise limits or add the keyed providers, copy `.env.example` to `.env.local`
and fill in what you have. Nothing breaks if you do not.

### Adding a sixth

Implement [`NewsProvider`](src/news/types.ts) in a new file under
`src/news/providers/`, then add it to the array in
[`src/news/registry.ts`](src/news/registry.ts). No component changes.

---

## Architecture

```
src/
  news/          The wire. Nothing here imports a component.
    types.ts       Article, SectionId, NewsProvider, Fidelity
    sections.ts    The seven desks, carried over from the 2012 navigation
    registry.ts    Provider list + availability
    client.ts      Fetch, cache, fallback — and the droid narration
    providers/     One adapter per upstream API
  droid/         NB-3O. The only place that knows about the legacy build.
    ledger.ts      16 audited findings
    useCases.ts    The five use cases, as data
    log.ts         Append-only transmission store
    *.tsx          Panel, tabs, launcher, avatar, legacy canvas guide
  components/    Presentation. Knows about Article, never about a provider.
  hooks/         Router, data loading, document title, viewport
  pages/         Section feed and the About page
```

The dependency rule is one-directional: `components` may import from `news` for
types only; `news` never imports from `components`. That is what makes UC-04 —
swapping the source at runtime — a two-line change rather than a refactor.

---

## Mobile-first, concretely

Not a styling claim. Structural decisions that differ by breakpoint:

- The droid panel is a **modal bottom sheet** with a backdrop and
  Escape-to-dismiss below `lg`, and a **non-modal side rail** above it, because
  a desktop reader should be able to change protocol and watch the page
  re-render at the same time.
- The desk navigation scrolls horizontally with snap points on a phone and
  centres on a desktop.
- The sidebar is written *after* the main content in the DOM, so reading order
  and visual order agree at every width. The legacy build put its 175px
  advertising rail first, which meant ads before news on any narrow screen.
- Images are sized with `aspect-ratio`, never `width`/`height` attributes.
- Dark theme via `prefers-color-scheme`, implemented as a swap of six semantic
  tokens rather than a parallel set of classes.

Verified: at a 375px viewport `scrollWidth === clientWidth`. The page does not
scroll sideways.

---

## Deployment

The demo is live inside the portfolio it belongs to:

**<https://menokoog.github.io/Past-Web-Projects-for-Clients-main/protocol-droid/>**

GitHub Pages serves this repository from the `main` branch at the repository
root, and the portfolio is entirely committed static files. The built demo
follows that convention rather than introducing a second host: `npm run build`
writes to `protocol-droid/` at the repository root, which is committed.

Two settings in [`vite.config.ts`](vite.config.ts) make that work:

- `base` is set to the Pages sub-path for production builds and left at `/` in
  development, so assets resolve under `/Past-Web-Projects-for-Clients-main/protocol-droid/`.
- `outDir` points at the repository root, with `emptyOutDir` opted into
  because the target sits outside the Vite root.

Routing is hash-based, so no server rewrite rule is needed — the build also
works opened straight from disk. A `.nojekyll` file at the repository root
keeps Pages from running the output through Jekyll.

**To publish a change:**

```bash
npm run build          # rewrites protocol-droid/ at the repo root
git add ../../protocol-droid && git commit -m "Rebuild protocol droid demo"
git push               # Pages redeploys from main
```

The demo is reached from the portfolio home page in two places: the sidebar
menu and a feature post above the fold.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Vite dev server on :5173 |
| `npm run build` | Type-check, then build to `protocol-droid/` at the repo root |
| `npm run preview` | Serve the built output |
| `npm run typecheck` | `tsc --noEmit` |

TypeScript runs with `strict`, plus `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `noImplicitOverride` and `verbatimModuleSyntax`.

Routing is a 40-line hash router
([`src/hooks/useRouter.ts`](src/hooks/useRouter.ts)) rather than a dependency —
which also means `dist/` deploys to any static host, or opens from a plain
folder, exactly like the site it replaces.

---

## Documentation

- **[docs/USE-CASES.md](docs/USE-CASES.md)** — the five use cases in full, with
  actors, preconditions, main and alternate flows, postconditions, a worked
  translation example, non-goals, and a traceability table.
- The same five are rendered in-app at **About this rebuild** (`#/about`), from
  [`src/droid/useCases.ts`](src/droid/useCases.ts).
