import type { ProviderId, SectionId } from '@/news/types'
import { getSection } from '@/news/sections'
import { useArticles } from '@/hooks/useArticles'
import { ArticleCard } from './ArticleCard'
import { SectionPanel } from './SectionPanel'

interface DeskDigestProps {
  readonly sectionId: SectionId
  readonly providerId: ProviderId
  readonly limit?: number
}

/**
 * A short headline list for one desk, used in the front page rail.
 *
 * This is the direct descendant of the legacy homepage, which stacked Latest
 * News, Obituaries, Social, Letters and Events as hand-maintained blocks of
 * pasted HTML. Same information architecture; the blocks now fetch themselves.
 */
export function DeskDigest({ sectionId, providerId, limit = 4 }: DeskDigestProps) {
  const section = getSection(sectionId)
  const { status, articles } = useArticles(sectionId, providerId)
  const visible = articles.slice(0, limit)

  return (
    <SectionPanel title={section.label} moreSectionId={sectionId}>
      {status === 'loading' ? (
        <ul className="space-y-3 py-1" aria-hidden="true">
          {Array.from({ length: limit }, (_, index) => (
            <li key={index} className="space-y-1.5">
              <div className="h-3.5 w-full animate-pulse rounded bg-rule" />
              <div className="h-3.5 w-3/5 animate-pulse rounded bg-rule" />
            </li>
          ))}
        </ul>
      ) : null}

      {status === 'ready' && visible.length === 0 ? (
        <p className="py-2 text-sm text-muted">Nothing filed to this desk right now.</p>
      ) : null}

      {status === 'error' ? (
        <p className="py-2 text-sm text-muted">This desk is unreachable at the moment.</p>
      ) : null}

      {visible.map((article) => (
        <ArticleCard key={article.id} article={article} variant="compact" />
      ))}
    </SectionPanel>
  )
}
