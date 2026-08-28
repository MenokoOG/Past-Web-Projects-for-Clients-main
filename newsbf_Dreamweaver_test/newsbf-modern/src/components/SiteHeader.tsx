import { formatDateTime } from '@/lib/format'
import { hrefFor } from '@/hooks/useRouter'

/**
 * The masthead.
 *
 * The 2012 header was a 990px box holding a 640x190 JPEG of a farm at sunset
 * and a hotlinked http weather widget — 225px of fixed chrome before a phone
 * reader reached a single headline. This says the same thing in type: the
 * name, the place, and the date, at a height that scales with the viewport.
 */
export function SiteHeader() {
  const today = new Date()

  return (
    <header className="border-b-4 border-press-700 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 py-5 text-center sm:py-7">
        <a
          href={hrefFor({ name: 'section', sectionId: 'front' })}
          className="group inline-block"
          aria-label="News Bonners Ferry, front page"
        >
          <span className="block font-display text-[1.75rem] leading-none font-bold tracking-tight text-press-700 sm:text-5xl lg:text-6xl dark:text-accent">
            News Bonners Ferry
          </span>
        </a>

        <p className="text-[0.7rem] tracking-[0.28em] text-muted uppercase sm:text-xs">
          Boundary County · Idaho
        </p>

        <div
          className="mt-1 flex w-full items-center gap-3 text-[0.68rem] text-muted sm:text-xs"
          aria-hidden="true"
        >
          <span className="h-px flex-1 bg-rule" />
          <time dateTime={today.toISOString()} className="tracking-wide whitespace-nowrap">
            {formatDateTime(today.toISOString())}
          </time>
          <span className="h-px flex-1 bg-rule" />
        </div>
      </div>
    </header>
  )
}
