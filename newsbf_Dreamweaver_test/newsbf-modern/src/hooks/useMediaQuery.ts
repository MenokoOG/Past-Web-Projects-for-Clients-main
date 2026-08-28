import { useSyncExternalStore } from 'react'

/**
 * Reads a media query reactively. Used to decide whether the droid panel
 * behaves as a bottom sheet (mobile) or a side rail (desktop) — a structural
 * difference that CSS alone cannot express, since the two need different
 * focus and dismissal behaviour.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (listener) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', listener)
      return () => {
        list.removeEventListener('change', listener)
      }
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
