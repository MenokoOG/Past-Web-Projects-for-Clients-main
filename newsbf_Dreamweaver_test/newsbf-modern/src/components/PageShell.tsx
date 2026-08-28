import type { ReactNode } from 'react'

interface PageShellProps {
  readonly children: ReactNode
  /**
   * Optional secondary column. On a phone it stacks beneath the story feed —
   * the reverse of the legacy build, where the 175px advertising rail came
   * first in the source and so appeared above the news on any narrow screen.
   */
  readonly aside?: ReactNode
}

/**
 * The page container that replaces #big_wrapper.
 *
 * Legacy: width 1000px, three floated children, hand-cleared. Modern: a fluid
 * max-width container and a grid that is one column until there is room for
 * two. The sidebar is written after the main content in the DOM, so reading
 * order and visual order agree at every width.
 */
export function PageShell({ children, aside }: PageShellProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-4 sm:py-7">
      {aside ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
          <main id="main" className="min-w-0">
            {children}
          </main>
          <aside className="min-w-0 space-y-5">{aside}</aside>
        </div>
      ) : (
        <main id="main" className="min-w-0">
          {children}
        </main>
      )}
    </div>
  )
}
