import { useDroid } from '@/droid/DroidContext'
import { DroidAvatar } from '@/droid/DroidAvatar'
import { LEDGER } from '@/droid/ledger'
import { PROVIDERS } from '@/news/registry'

/**
 * The droid's standing invitation, in the rail.
 *
 * Without this the panel is a hidden feature behind a floating button. The
 * callout states what the droid is for in one sentence and gives two direct
 * entry points, which is the difference between a demo people find and a demo
 * people are told about.
 */
export function DroidCallout() {
  const { openPanel } = useDroid()

  return (
    <section className="overflow-hidden rounded-lg border-2 border-gold-400 bg-paper">
      <div className="flex items-center gap-3 bg-press-700 px-4 py-3">
        <DroidAvatar mood="idle" className="h-9 w-9 shrink-0" />
        <div className="min-w-0">
          <h2 className="font-display leading-none font-bold text-white">NB-3O</h2>
          <p className="mt-1 text-[0.68rem] tracking-wide text-gold-300 uppercase">
            Protocol droid
          </p>
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed text-muted">
          I translate this newsroom between formats. I hold{' '}
          <strong className="font-semibold text-body">{LEDGER.length} findings</strong> from the
          2012 build and speak{' '}
          <strong className="font-semibold text-body">{PROVIDERS.length} news protocols</strong>.
          Every story on this page passed through me on its way to your screen.
        </p>

        <div className="mt-3 grid gap-2">
          <button
            type="button"
            onClick={() => openPanel('ledger')}
            className="rounded bg-press-700 px-3 py-2 text-sm font-bold text-gold-300 transition-colors hover:bg-press-800 hover:text-gold-400"
          >
            What did you change?
          </button>
          <button
            type="button"
            onClick={() => openPanel('log')}
            className="rounded border border-press-700 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
          >
            Show me the live wire
          </button>
        </div>
      </div>
    </section>
  )
}
