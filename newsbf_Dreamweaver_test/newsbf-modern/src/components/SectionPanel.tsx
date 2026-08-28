import type { ReactNode } from 'react'
import type { SectionId } from '@/news/types'
import { hrefFor } from '@/hooks/useRouter'

interface SectionPanelProps {
  readonly title: string
  readonly children: ReactNode
  /** Renders the legacy "More X →" button when set. */
  readonly moreSectionId?: SectionId
  readonly moreLabel?: string
}

/**
 * The one component that replaces five hand-written ID rules.
 *
 * main.css declared #recentnews, #Obituary, #social, #letters and #events with
 * the same border, padding and alignment repeated verbatim in each. The blue
 * heading bar and the gold "More" button are preserved on purpose — they are
 * the paper's visual signature — but they are now defined once.
 */
export function SectionPanel({ title, children, moreSectionId, moreLabel }: SectionPanelProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-rule bg-paper">
      <h2 className="bg-press-700 px-4 py-2.5 font-display text-sm tracking-[0.18em] text-white uppercase">
        {title}
      </h2>

      <div className="px-4 py-3">{children}</div>

      {moreSectionId ? (
        <div className="border-t border-rule px-4 py-3">
          <a
            href={hrefFor({ name: 'section', sectionId: moreSectionId })}
            className="inline-flex items-center gap-1.5 rounded bg-press-700 px-3.5 py-2 text-sm font-bold text-gold-300 transition-colors hover:bg-press-800 hover:text-gold-400"
          >
            {moreLabel ?? `More ${title}`}
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      ) : null}
    </section>
  )
}
