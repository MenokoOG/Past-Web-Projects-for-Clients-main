import type { Fidelity, SectionId } from '@/news/types'
import { PROVIDERS } from '@/news/registry'
import { getSection } from '@/news/sections'
import { useDroid } from './DroidContext'
import { useViewportWidth } from '@/hooks/useViewportWidth'

const LEGACY_CANVAS_PX = 1000

const FIDELITY_COPY: Readonly<Record<Fidelity, { label: string; className: string }>> = {
  native: {
    label: 'Native',
    className: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400',
  },
  translated: {
    label: 'Translated',
    className: 'bg-gold-400/20 text-gold-600 dark:text-gold-300',
  },
  unsupported: {
    label: 'Unavailable',
    className: 'bg-flag-500/10 text-flag-500',
  },
}

interface ProtocolsTabProps {
  readonly sectionId: SectionId
}

/**
 * The protocols the droid speaks, and how well it speaks each of them for the
 * desk currently on screen.
 *
 * Switching provider here re-renders the same page from a different upstream
 * wire format — which is the whole demonstration. The reading experience is
 * unchanged; only the dialect behind it moves.
 */
export function ProtocolsTab({ sectionId }: ProtocolsTabProps) {
  const { providerId, selectProvider, showLegacyGuide, toggleLegacyGuide, purgeMemory } = useDroid()
  const viewportWidth = useViewportWidth()
  const section = getSection(sectionId)

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        Fluent in {PROVIDERS.length} news protocols. Ratings below describe how faithfully each
        one can serve the <strong className="font-semibold text-body">{section.label}</strong>{' '}
        desk.
      </p>

      <ul className="space-y-2">
        {PROVIDERS.map((provider) => {
          const blocked = provider.unavailableReason()
          const fidelity = provider.fidelity(sectionId)
          const isActive = provider.id === providerId
          const badge = FIDELITY_COPY[fidelity]

          return (
            <li key={provider.id}>
              <button
                type="button"
                disabled={blocked !== null}
                onClick={() => selectProvider(provider.id)}
                aria-pressed={isActive}
                className={[
                  'w-full rounded-lg border p-3 text-left transition-colors',
                  isActive
                    ? 'border-press-700 bg-accent-soft'
                    : 'border-rule bg-canvas/60 hover:border-accent',
                  blocked ? 'cursor-not-allowed opacity-60 hover:border-rule' : '',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium">
                    {provider.label}
                    {isActive ? (
                      <span className="rounded-full bg-press-700 px-1.5 py-0.5 text-[0.55rem] font-bold tracking-wider text-white uppercase">
                        Active
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wider uppercase ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <p className="mt-1 text-xs text-muted">
                  {blocked ?? provider.describeQuery(sectionId)}
                </p>

                <p className="mt-1.5 text-[0.65rem] tracking-wide text-muted uppercase">
                  {provider.keyless ? 'No API key required' : 'API key required'}
                </p>
              </button>
            </li>
          )
        })}
      </ul>

      <section className="rounded-lg border border-rule p-3">
        <h3 className="text-[0.65rem] font-semibold tracking-[0.16em] text-muted uppercase">
          Canvas comparison
        </h3>
        <p className="mt-2 text-sm">
          This viewport is{' '}
          <strong className="font-mono font-semibold text-accent">{viewportWidth}px</strong> wide.
          The 2012 build was locked to{' '}
          <strong className="font-mono font-semibold">{LEGACY_CANVAS_PX}px</strong>.
        </p>
        <p className="mt-1 text-xs text-muted">
          {viewportWidth < LEGACY_CANVAS_PX
            ? `The old site would be overflowing by ${LEGACY_CANVAS_PX - viewportWidth}px right now, with no viewport tag to scale it down.`
            : 'At this width the old fixed canvas would fit — which is exactly the desktop it was designed for, and nothing else.'}
        </p>
        <button
          type="button"
          onClick={toggleLegacyGuide}
          aria-pressed={showLegacyGuide}
          className="mt-3 w-full rounded border border-press-700 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
        >
          {showLegacyGuide ? 'Hide the 1000px guide' : 'Overlay the 1000px guide'}
        </button>
      </section>

      <button
        type="button"
        onClick={purgeMemory}
        className="w-full rounded border border-rule px-3 py-2 text-sm text-muted transition-colors hover:border-flag-500 hover:text-flag-500"
      >
        Purge cached desks
      </button>
    </div>
  )
}
