# Past Web Projects for Clients

A portfolio of websites I hand-built for real clients between 2010 and 2013 — and,
sitting on top of it, a working demonstration of what it takes to bring one of
them into the present.

**[▶ Launch the Protocol Droid demo](https://menokoog.github.io/Past-Web-Projects-for-Clients-main/protocol-droid/)** · [Read the use cases](https://menokoog.github.io/Past-Web-Projects-for-Clients-main/protocol-droid/#/about) · [Browse the 2010–2013 portfolio](https://menokoog.github.io/Past-Web-Projects-for-Clients-main/)

---

## The Protocol Droid

Most "legacy modernization" demos are built on a toy codebase written that
morning. This one is not. The subject is **News Bonners Ferry**, a local
newspaper I actually shipped in 2012 for Boundary County, Idaho — Dreamweaver,
XHTML 1.0 Transitional, a 1000px fixed canvas, three float columns cleared by
hand, no viewport tag, and editable regions belonging to a content service that
has since shut down. It is still in this repository, untouched, so you can open
both and compare.

**NB-3O** is a protocol droid in the literal sense: it sits at a boundary
between vocabularies and translates. It does that in two directions at once,
and they turn out to be the same act.

### It explains the modernization

Open the droid and it holds **16 findings** from an audit of the original files.
Each one records what the 2012 build did, which file it lived in, what replaced
it, where the replacement lives, and why the change was worth making. Filter
them by area — layout, accessibility, analytics, markup, content, data — or ask
the droid to overlay the old 1000px canvas on the live page and tell you how far
it overflows your screen right now.

A sample of what is in the ledger:

| The 2012 build | What replaced it |
| --- | --- |
| No viewport meta tag — phones rendered the 1000px page zoomed out | `width=device-width`, with `viewport-fit=cover` |
| Three float columns at 175 / 490 / 270px, cleared by hand | CSS Grid collapsing to one column below `md` |
| Header, nav and footer pasted into 14 separate files | Three components rendered once from a route shell |
| `text-align: center` applied to `html, body, p, li` | Left-aligned measure capped at 68 characters |
| CushyCMS editable regions — the service no longer exists | Typed `Article` records from a provider registry |
| `ga.js` plus an eXTReMe Tracker `document.write` beacon | No third-party trackers at all |
| Copyright 2012 typed into every page footer | Year computed at render time |

### It translates the news wire

Every story on the page arrives through the droid, which turns **five different
news APIs** into one shape the site understands. Switch sources and watch the
paper re-render with completely different content and an identical layout —
that is the decoupling, demonstrated rather than claimed.

Ask it for **Obituaries** from a source that has no obituaries desk and it
rewrites the request as a keyword search, then tells you it did rather than
quietly pretending the result is equivalent:

```
HANDSHAKE   Switching protocol to Hacker News.
            The Guardian → Hacker News. The reading experience does not
            change; only the dialect behind it does.
TRANSLATE   Translating "Obituaries" into a dialect Hacker News understands.
            no desks upstream — rewritten as search "in memoriam"
COMPLETE    12 articles translated into the house format.            379ms
```

The log shows every handshake, translation, cache hit, fault and fallback as it
happens. None of it is scripted — each line is emitted by real code in the fetch
layer.

### It runs with no API key

| Source | Key needed | Role |
| --- | --- | --- |
| **The Guardian** | none | Default. Real general news with sections, bylines and images |
| **Spaceflight News** | none | Keyless and image-rich, but has no desks — the translation stress case |
| **Hacker News** | none | The lossiest source: no images, no summaries. Proves the cards degrade rather than break |
| **GNews** | optional | Free tier, 100 requests/day |
| **NewsAPI.org** | optional | Free plan is localhost-only — the droid reports that restriction up front |

Just open the link. There is nothing to configure.

**Stack:** TypeScript (strict, plus `noUncheckedIndexedAccess` and
`exactOptionalPropertyTypes`) · React 19 · Tailwind CSS v4 · Vite · mobile-first
· hash routing with no router dependency · 80 kB gzipped.

Source and full documentation live in
[`newsbf_Dreamweaver_test/newsbf-modern/`](./newsbf_Dreamweaver_test/newsbf-modern/),
including [five formal use cases](./newsbf_Dreamweaver_test/newsbf-modern/docs/USE-CASES.md)
with actors, preconditions, main and alternate flows, and a traceability table.

```bash
cd newsbf_Dreamweaver_test/newsbf-modern
npm install
npm run dev
```

---

## The 2010–2013 portfolio

These are real client engagements from when I was doing front-end development,
primarily in Adobe Dreamweaver, while earning my degree in web publishing from
American Military University. They are presented honestly as historical work —
the techniques are dated, and that is rather the point.

| Project | What it was |
| --- | --- |
| [Military Matters](./Military_Matters/index.html) | A military news and community site, built on the YUI library with page templates |
| [News Bonners Ferry](./newsbf_Dreamweaver_test/index.html) | A local newspaper — news, sports, events, obituaries, social and letters desks, plus advertising pages. **The subject of the droid demo above.** |
| [Roughnecks Motorcycle Club](./RMC_project/index.html) | A club site with chapter pages, events and galleries |
| [Easel Forge](./Easel_Forge/index.html) | An art business site |
| [Yoder's Discount Grocery](./Dreamweaver_Yoders/index.html) | Retail, with coupons and print stylesheets |
| [Tuttle's Carpet and Custodial](./Dreamweaver_Tuttle/index.html) | A service business, with ad creatives |
| [Jacob's Auto](./Dreamweaver_Jacobs_auto/index.html) | An auto shop |
| [Designer J](./Designer_J_website_old/Designer_J_website_old/index.html) | My own web design business site from the period |
| [Résumé](./my_resume_menoko/index.html) | My early résumé site |

Several still carry the original design notes and client content documents
alongside the markup.

---

## Why this repository is worth a look

The portfolio on its own documents longevity — I was delivering paid client web
work while serving in the Army, more than a decade before the current stack
existed. The droid does something the portfolio cannot do by itself: it makes
the distance between then and now **inspectable**. Not a before-and-after
screenshot, but a live page that will tell you, line by line and in real time,
what changed, where, and why.

---

## Repository layout

```
protocol-droid/            The built demo, served by GitHub Pages
newsbf_Dreamweaver_test/   The 2012 newspaper — untouched
  newsbf-modern/           Its modern rebuild (source)
    src/news/              The wire: five provider adapters behind one interface
    src/droid/             NB-3O: ledger, protocols, transmission log
    docs/USE-CASES.md      Five use cases, in full
Military_Matters/  RMC_project/  Easel_Forge/  ...     The rest of the portfolio
index.html                 The portfolio home page
```

Deployment notes — how the sub-path build works, and how to publish a change —
are in the [app README](./newsbf_Dreamweaver_test/newsbf-modern/README.md#deployment).

---

Built by Lawrence "Menoko OG" Jefferson II · [github.com/MenokoOG](https://github.com/MenokoOG)

LAHA — Love All Humans Always.
