import { useDroid } from './DroidContext'
import { useViewportWidth } from '@/hooks/useViewportWidth'

const LEGACY_CANVAS_PX = 1000

/**
 * A ruler laid over the live page showing the 1000px canvas the 2012 build was
 * locked to.
 *
 * Resizing the window with this on is the fastest way to see the actual
 * argument for the rebuild: the guide stays rigid while the paper reflows
 * around it, and below 1000px the guide simply runs off the screen — which is
 * precisely what the old site did to every phone that visited it.
 */
export function LegacyGuide() {
  const { showLegacyGuide } = useDroid()
  const viewportWidth = useViewportWidth()

  if (!showLegacyGuide) return null

  const overflowing = viewportWidth < LEGACY_CANVAS_PX

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex justify-center" aria-hidden="true">
      <div
        style={{ width: `${LEGACY_CANVAS_PX}px` }}
        className={[
          'relative h-full border-x-2 border-dashed',
          overflowing ? 'border-flag-500/70' : 'border-press-700/50',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-2 left-1/2 -translate-x-1/2 rounded px-2 py-1 font-mono text-[0.65rem] font-bold text-white shadow',
            overflowing ? 'bg-flag-500' : 'bg-press-700',
          ].join(' ')}
        >
          2012 canvas: {LEGACY_CANVAS_PX}px fixed
          {overflowing ? ` · overflowing by ${LEGACY_CANVAS_PX - viewportWidth}px` : ''}
        </span>
      </div>
    </div>
  )
}
