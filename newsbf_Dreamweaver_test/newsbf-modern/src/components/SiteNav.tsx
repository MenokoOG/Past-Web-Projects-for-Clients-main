import type { SectionId } from '@/news/types'
import { SECTIONS } from '@/news/sections'
import { hrefFor } from '@/hooks/useRouter'

interface SiteNavProps {
  readonly activeSectionId: SectionId | null
}

/**
 * The desk navigation.
 *
 * Legacy behaviour worth keeping: the blue bar, the uppercase letterspaced
 * labels, the highlighted current desk. Legacy behaviour worth dropping: a
 * 910px unordered list of floated anchors that simply ran off the side of a
 * phone. Below the sm breakpoint this scrolls horizontally with momentum;
 * above it, the row centres exactly as it always did.
 *
 * The active desk is marked with aria-current, not only a colour change, so
 * the highlight is available to readers who cannot see it.
 */
export function SiteNav({ activeSectionId }: SiteNavProps) {
  return (
    <nav
      aria-label="Sections"
      className="sticky top-0 z-30 border-b border-press-900/40 bg-press-700 shadow-sm"
    >
      <ul
        className="mx-auto flex max-w-6xl snap-x snap-mandatory gap-0.5 overflow-x-auto px-2 [scrollbar-width:none] sm:justify-center sm:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        {SECTIONS.map((section) => {
          const isActive = section.id === activeSectionId
          return (
            <li key={section.id} className="snap-start">
              <a
                href={hrefFor({ name: 'section', sectionId: section.id })}
                {...(isActive ? { 'aria-current': 'page' as const } : {})}
                className={[
                  'block px-3 py-3 text-xs font-medium tracking-[0.14em] whitespace-nowrap uppercase transition-colors sm:px-5 sm:text-[0.8rem]',
                  isActive
                    ? 'bg-paper text-press-700 dark:text-accent'
                    : 'text-white/85 hover:bg-press-800 hover:text-gold-400',
                ].join(' ')}
              >
                {section.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
