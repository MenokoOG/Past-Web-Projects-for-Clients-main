import type { TransmissionKind } from './types'
import { clearLog, useTransmissions } from './log'
import { formatClock } from '@/lib/format'

const KIND_STYLE: Readonly<Record<TransmissionKind, { label: string; className: string }>> = {
  handshake: { label: 'Handshake', className: 'bg-press-700/12 text-accent' },
  translate: { label: 'Translate', className: 'bg-gold-400/20 text-gold-600 dark:text-gold-300' },
  success: { label: 'Complete', className: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400' },
  cache: { label: 'Memory', className: 'bg-muted/15 text-muted' },
  warning: { label: 'Degraded', className: 'bg-gold-500/20 text-gold-600 dark:text-gold-300' },
  fault: { label: 'Fault', className: 'bg-flag-500/12 text-flag-500' },
}

/**
 * The transmission log.
 *
 * Every line here is emitted by real code in `src/news/client.ts` as the
 * request happens — handshakes, vocabulary translations, cache hits, failures
 * and automatic fallbacks. Nothing is scripted, which is what makes it useful
 * for demonstrating that the modernization is actually running.
 */
export function LogTab() {
  const transmissions = useTransmissions()

  if (transmissions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-rule px-3 py-8 text-center text-sm text-muted">
        No transmissions yet. Choose a desk and I shall narrate the exchange.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted">
          {transmissions.length} transmission{transmissions.length === 1 ? '' : 's'}, newest
          first.
        </p>
        <button
          type="button"
          onClick={clearLog}
          className="rounded border border-rule px-2 py-1 text-xs text-muted transition-colors hover:border-flag-500 hover:text-flag-500"
        >
          Clear
        </button>
      </div>

      <ol className="space-y-2">
        {transmissions.map((entry) => {
          const style = KIND_STYLE[entry.kind]
          return (
            <li
              key={entry.id}
              className="rounded-lg border border-rule bg-canvas/60 p-2.5 text-sm"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span
                  className={`rounded px-1.5 py-0.5 text-[0.58rem] font-bold tracking-wider uppercase ${style.className}`}
                >
                  {style.label}
                </span>
                <time className="font-mono text-[0.68rem] text-muted">
                  {formatClock(entry.at)}
                </time>
                {entry.durationMs !== undefined ? (
                  <span className="font-mono text-[0.68rem] text-muted">
                    {entry.durationMs}ms
                  </span>
                ) : null}
              </div>

              <p className="mt-1.5 leading-snug font-medium">{entry.headline}</p>
              <p className="mt-0.5 text-xs leading-relaxed break-words text-muted">
                {entry.detail}
              </p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
