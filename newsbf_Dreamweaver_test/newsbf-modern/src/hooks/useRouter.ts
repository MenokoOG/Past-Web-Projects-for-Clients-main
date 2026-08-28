import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import type { SectionId } from '@/news/types'
import { isSectionId } from '@/news/sections'

/**
 * A hash router in forty lines.
 *
 * The original site navigated by loading a whole new document per desk. This
 * restores that mental model — real URLs, a working back button, shareable
 * links — without adding a routing dependency for seven static routes. Hash
 * routing also means the build deploys to any static host, including a plain
 * folder opened from disk, exactly like the site it replaces.
 */
export type Route =
  | { readonly name: 'section'; readonly sectionId: SectionId }
  | { readonly name: 'about' }

function parse(hash: string): Route {
  const path = hash.replace(/^#\/?/, '').trim()
  if (path === 'about') return { name: 'about' }
  if (path === '') return { name: 'section', sectionId: 'front' }
  return isSectionId(path)
    ? { name: 'section', sectionId: path }
    : { name: 'section', sectionId: 'front' }
}

function subscribe(listener: () => void): () => void {
  window.addEventListener('hashchange', listener)
  return () => {
    window.removeEventListener('hashchange', listener)
  }
}

function getSnapshot(): string {
  return window.location.hash
}

export function hrefFor(route: Route): string {
  if (route.name === 'about') return '#/about'
  return route.sectionId === 'front' ? '#/' : `#/${route.sectionId}`
}

export interface RouterApi {
  readonly route: Route
  readonly navigate: (route: Route) => void
}

export function useRouter(): RouterApi {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const route = useMemo(() => parse(hash), [hash])

  const navigate = useCallback((next: Route) => {
    window.location.hash = hrefFor(next)
  }, [])

  // Every desk is a fresh page to the reader, so restore the scroll position
  // the way a document navigation would have.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [route.name, route.name === 'section' ? route.sectionId : ''])

  return { route, navigate }
}
