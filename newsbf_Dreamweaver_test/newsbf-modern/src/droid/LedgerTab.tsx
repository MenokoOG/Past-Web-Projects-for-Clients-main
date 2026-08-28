import { useMemo, useState } from 'react'
import type { LedgerCategory } from './types'
import { CATEGORY_LABELS, LEDGER, LEDGER_CATEGORIES } from './ledger'

/**
 * The translation ledger, as the reader sees it.
 *
 * This is the droid's core justification: for every change, what the old build
 * did, what replaced it, where both live, and why it was worth doing. Kept in
 * data rather than prose so the count is honest and the filter is real.
 */
export function LedgerTab() {
  const [filter, setFilter] = useState<LedgerCategory | 'all'>('all')

  const entries = useMemo(
    () => (filter === 'all' ? LEDGER : LEDGER.filter((entry) => entry.category === filter)),
    [filter],
  )

  const counts = useMemo(() => {
    const map = new Map<LedgerCategory, number>()
    for (const entry of LEDGER) map.set(entry.category, (map.get(entry.category) ?? 0) + 1)
    return map
  }, [])

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {LEDGER.length} findings from the audit of the 2012 Dreamweaver build, each with the
        change that replaced it.
      </p>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter findings by area">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          All {LEDGER.length}
        </FilterChip>
        {LEDGER_CATEGORIES.map((category) => (
          <FilterChip
            key={category}
            active={filter === category}
            onClick={() => setFilter(category)}
          >
            {CATEGORY_LABELS[category]} {counts.get(category) ?? 0}
          </FilterChip>
        ))}
      </div>

      <ol className="space-y-2.5">
        {entries.map((entry) => (
          <li key={entry.id}>
            <details className="group rounded-lg border border-rule bg-canvas/60 open:bg-paper">
              <summary className="cursor-pointer list-none px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[0.6rem] font-semibold tracking-[0.14em] text-accent uppercase">
                      {CATEGORY_LABELS[entry.category]}
                    </span>
                    <p className="mt-0.5 text-sm leading-snug font-medium">{entry.modern}</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-xs text-muted transition-transform group-open:rotate-90"
                  >
                    &#9654;
                  </span>
                </div>
              </summary>

              <div className="space-y-3 border-t border-rule px-3 py-3 text-sm">
                <Row label="Was" tone="was" text={entry.legacy} path={entry.legacyPath} />
                <Row label="Now" tone="now" text={entry.modern} path={entry.modernPath} />
                <p className="text-sm leading-relaxed text-muted">{entry.rationale}</p>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Row({
  label,
  tone,
  text,
  path,
}: {
  readonly label: string
  readonly tone: 'was' | 'now'
  readonly text: string
  readonly path: string
}) {
  return (
    <div>
      <span
        className={[
          'inline-block rounded px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wider uppercase',
          tone === 'was'
            ? 'bg-flag-500/10 text-flag-500'
            : 'bg-accent-soft text-accent',
        ].join(' ')}
      >
        {label}
      </span>
      <p className="mt-1 leading-snug">{text}</p>
      <p className="mt-0.5 font-mono text-[0.68rem] break-all text-muted">{path}</p>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  readonly active: boolean
  readonly onClick: () => void
  readonly children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors',
        active
          ? 'border-press-700 bg-press-700 text-white'
          : 'border-rule text-muted hover:border-accent hover:text-accent',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
