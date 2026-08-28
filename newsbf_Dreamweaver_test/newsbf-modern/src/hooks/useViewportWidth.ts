import { useSyncExternalStore } from 'react'

/**
 * The live viewport width, in CSS pixels.
 *
 * The droid reports this beside the legacy build's fixed 1000px canvas, which
 * turns an abstract complaint about responsive design into a number the
 * viewer can watch change as they resize the window.
 */
export function useViewportWidth(): number {
  return useSyncExternalStore(
    (listener) => {
      window.addEventListener('resize', listener, { passive: true })
      return () => {
        window.removeEventListener('resize', listener)
      }
    },
    () => window.innerWidth,
    () => 1024,
  )
}
