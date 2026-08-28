import { useEffect } from 'react'

const SUFFIX = 'News Bonners Ferry'

/**
 * The 2012 build titled its news page simply "News". A document title is the
 * tab label, the bookmark name and the search-result headline at once, so each
 * route sets a descriptive one.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} — ${SUFFIX}` : SUFFIX
  }, [title])
}
