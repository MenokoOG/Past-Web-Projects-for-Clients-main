import type { LedgerCategory, LedgerEntry } from './types'

/**
 * The translation ledger.
 *
 * Every row is a real finding from the audit of the 2012 Dreamweaver build in
 * the parent directory — not an illustration. The droid reads from this file
 * to explain what it changed and why, which keeps the explanation and the
 * codebase from drifting apart.
 */
export const LEDGER: readonly LedgerEntry[] = [
  {
    id: 'doctype',
    legacy: 'XHTML 1.0 Transitional served as text/html',
    legacyPath: 'index.html:1',
    modern: 'HTML5 document with an explicit language',
    modernPath: 'newsbf-modern/index.html',
    category: 'markup',
    rationale:
      'XHTML Transitional was a compatibility bridge for 2002. HTML5 is what every current parser actually implements, and the lang attribute is what a screen reader uses to pick a voice.',
  },
  {
    id: 'viewport',
    legacy: 'No viewport meta tag — phones rendered the 1000px page zoomed out',
    legacyPath: 'index.html (head)',
    modern: 'width=device-width, with viewport-fit=cover for notched displays',
    modernPath: 'newsbf-modern/index.html',
    category: 'layout',
    rationale:
      'This single missing tag is why the original was unreadable on a phone. It is the precondition for every other mobile-first decision here.',
  },
  {
    id: 'fixed-width',
    legacy: 'big_wrapper locked to width: 1000px',
    legacyPath: 'main.css (#big_wrapper)',
    modern: 'Fluid container that grows through mobile, tablet and desktop breakpoints',
    modernPath: 'src/components/PageShell.tsx',
    category: 'layout',
    rationale:
      'A fixed canvas cannot serve a readership that is now majority mobile. Layout is authored for the small screen first, then progressively enhanced upward.',
  },
  {
    id: 'float-columns',
    legacy: 'Three float columns at 175px / 490px / 270px, cleared by hand',
    legacyPath: 'main.css (#leftbar, #main_content, #rightbar)',
    modern: 'CSS Grid that collapses to a single column below the md breakpoint',
    modernPath: 'src/components/PageShell.tsx',
    category: 'layout',
    rationale:
      'Floats were a hack for a job they were never designed to do. Grid states the same intent declaratively and reflows without clearfix workarounds.',
  },
  {
    id: 'body-centering',
    legacy: 'text-align: center applied to html, body, p, li and blockquote',
    legacyPath: 'main.css:3',
    modern: 'Left-aligned measure capped near 68 characters',
    modernPath: 'src/index.css',
    category: 'accessibility',
    rationale:
      'Centred body copy forces the eye to hunt for each new line start. Ragged-right text at a controlled measure is measurably easier to read, especially for dyslexic readers.',
  },
  {
    id: 'id-styling',
    legacy:
      'One bespoke ID rule per content block — recentnews, Obituary, social, letters, events — each repeating the same border and padding',
    legacyPath: 'main.css',
    modern: 'A single reusable SectionPanel component built from Tailwind utilities',
    modernPath: 'src/components/SectionPanel.tsx',
    category: 'styling',
    rationale:
      'Five near-identical rules meant five places to edit for one design change. The component collapses them into one, and the utilities keep styling beside the markup it applies to.',
  },
  {
    id: 'chrome-duplication',
    legacy:
      'Header, nav and the three-column footer copy-pasted into all eight pages plus six article templates',
    legacyPath: 'index.html, news.html, sports.html, events.html, obituaries.html, social.html, letters.html, articles/',
    modern: 'SiteHeader, SiteNav and SiteFooter rendered once from a route shell',
    modernPath: 'src/components/SiteHeader.tsx, SiteNav.tsx, SiteFooter.tsx',
    category: 'markup',
    rationale:
      'The publisher address block appears fourteen times in the original. Changing a phone number was a fourteen-file edit, which is exactly how sites end up with stale contact details.',
  },
  {
    id: 'cushycms',
    legacy: 'Editable regions marked with the cushycms class and filled by a hosted third-party editor',
    legacyPath: 'index.html (recentnews, Obituary, social, letters, events)',
    modern: 'Typed Article records fetched from a news API through a provider registry',
    modernPath: 'src/news/client.ts',
    category: 'content',
    rationale:
      'CushyCMS shut down and took the editing workflow with it. Content now arrives as data with a known shape, so the presentation layer cannot be broken by a paste from a word processor.',
  },
  {
    id: 'article-templates',
    legacy: 'Six near-identical article template files, one duplicated per desk',
    legacyPath: 'articles/news/news_article_template.html and five siblings',
    modern: 'One ArticleCard and one section route, driven by the section id',
    modernPath: 'src/components/ArticleCard.tsx, src/pages/SectionPage.tsx',
    category: 'content',
    rationale:
      'Publishing a story meant duplicating a file and hand-editing markup. The desk is now a parameter rather than a copy.',
  },
  {
    id: 'no-data-layer',
    legacy: 'Article text hard-coded into HTML, with no data layer of any kind',
    legacyPath: 'articles/',
    modern: 'A NewsProvider interface with five interchangeable adapters',
    modernPath: 'src/news/providers/',
    category: 'data',
    rationale:
      'Separating the wire format from the render tree is what makes the source swappable at runtime. The droid uses exactly that seam to demonstrate the modernization live.',
  },
  {
    id: 'analytics',
    legacy: 'Classic Google Analytics ga.js, plus an eXTReMe Tracker beacon written with document.write',
    legacyPath: 'index.html (inline script)',
    modern: 'No third-party trackers and no document.write',
    modernPath: 'newsbf-modern/index.html',
    category: 'analytics',
    rationale:
      'ga.js was switched off in 2023, so the tag collected nothing while still costing every reader a blocking request. document.write stalls the parser on top of that.',
  },
  {
    id: 'mixed-content',
    legacy: 'Weather widget and affiliate banners hotlinked over plain http',
    legacyPath: 'index.html (header)',
    modern: 'Remote assets forced to https, with image failures handled inside the card',
    modernPath: 'src/lib/text.ts, src/components/ArticleCard.tsx',
    category: 'markup',
    rationale:
      'Browsers block mixed content outright, so those images were simply missing for anyone on https. A dead image also has to fail gracefully instead of leaving a broken icon.',
  },
  {
    id: 'presentational-attrs',
    legacy: 'Presentation in attributes: border and width and height on images, plus fltlft and fltrt float helpers',
    legacyPath: 'index.html, main.css',
    modern: 'Styling expressed entirely in CSS, with intrinsic sizing via aspect-ratio',
    modernPath: 'src/components/ArticleCard.tsx',
    category: 'styling',
    rationale:
      'Presentation held in attributes cannot respond to a breakpoint. Moving it into CSS is what lets one set of markup serve a phone and a desktop.',
  },
  {
    id: 'nav-semantics',
    legacy: 'Navigation built as a div, with the active item marked by a class alone',
    legacyPath: 'index.html (menu), main.css (.current_page_item)',
    modern: 'A nav landmark, aria-current on the active desk, and a skip link',
    modernPath: 'src/components/SiteNav.tsx',
    category: 'accessibility',
    rationale:
      'A visual highlight tells a sighted reader where they are. aria-current tells everyone else, and the skip link spares keyboard users seven tab stops on every page.',
  },
  {
    id: 'page-titles',
    legacy: 'Generic per-page titles — news.html is titled simply News',
    legacyPath: 'news.html:6',
    modern: 'Descriptive titles set per route, including the publication name',
    modernPath: 'src/hooks/useDocumentTitle.ts',
    category: 'accessibility',
    rationale:
      'The title is the tab label, the bookmark name and the search-result headline all at once. A bare word identifies none of them.',
  },
  {
    id: 'hardcoded-year',
    legacy: 'Copyright 2012 typed into every page footer',
    legacyPath: 'index.html (footer)',
    modern: 'Year computed at render time',
    modernPath: 'src/components/SiteFooter.tsx',
    category: 'content',
    rationale:
      'A stale copyright line is the clearest signal that a site has been abandoned. It should never have been a literal.',
  },
]

export const CATEGORY_LABELS: Readonly<Record<LedgerCategory, string>> = {
  markup: 'Markup',
  layout: 'Layout',
  styling: 'Styling',
  content: 'Content',
  data: 'Data',
  analytics: 'Analytics',
  accessibility: 'Accessibility',
}

export const LEDGER_CATEGORIES = Object.keys(CATEGORY_LABELS) as readonly LedgerCategory[]
