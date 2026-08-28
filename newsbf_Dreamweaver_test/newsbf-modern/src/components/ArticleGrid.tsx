import type { Article } from '@/news/types'
import { ArticleCard } from './ArticleCard'

interface ArticleGridProps {
  readonly articles: readonly Article[]
  /** Promotes the first story to a full-width lead, as a front page would. */
  readonly leadFirst?: boolean
}

/**
 * One column on a phone, two on a tablet, three on a desktop.
 *
 * This replaces the fixed 175 / 490 / 270 float arrangement. The order of the
 * markup is the reading order at every width, which is what makes the collapse
 * to a single column correct rather than merely narrow.
 */
export function ArticleGrid({ articles, leadFirst = false }: ArticleGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {articles.map((article, index) => (
        <ArticleCard
          key={article.id}
          article={article}
          variant={leadFirst && index === 0 ? 'lead' : 'standard'}
          priority={index === 0}
        />
      ))}
    </div>
  )
}

/** Matches the grid's shape so the page does not jump when content lands. */
export function ArticleGridSkeleton({ count = 6 }: { readonly count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border border-rule bg-paper"
        >
          <div className="aspect-[16/9] animate-pulse bg-rule" />
          <div className="space-y-2 p-4">
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-rule" />
            <div className="h-4 w-full animate-pulse rounded bg-rule" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-rule" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-rule" />
          </div>
        </div>
      ))}
    </div>
  )
}
