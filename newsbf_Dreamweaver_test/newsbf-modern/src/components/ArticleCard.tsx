import { useState } from 'react'
import type { Article } from '@/news/types'
import { timeAgo } from '@/lib/format'

export type CardVariant = 'lead' | 'standard' | 'compact'

interface ArticleCardProps {
  readonly article: Article
  readonly variant?: CardVariant
  /** Lead images are eager; everything below the fold is lazy. */
  readonly priority?: boolean
}

/**
 * One story, in three densities.
 *
 * Two legacy problems are fixed here structurally rather than cosmetically.
 * First, images are sized with aspect-ratio instead of width and height
 * attributes, so one card serves every breakpoint. Second, a broken image is
 * caught and the card reflows into its text-only form — the original left a
 * broken-icon placeholder wherever an http asset was blocked, which was most
 * of them.
 */
export function ArticleCard({ article, variant = 'standard', priority = false }: ArticleCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(article.imageUrl) && !imageFailed

  if (variant === 'compact') {
    return (
      <article className="border-b border-rule py-3 last:border-b-0">
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="group block">
          <h3 className="font-display text-base leading-snug font-semibold group-hover:text-accent">
            {article.title}
          </h3>
          <Meta article={article} className="mt-1" />
        </a>
      </article>
    )
  }

  const isLead = variant === 'lead'

  return (
    <article
      className={[
        'group overflow-hidden rounded-lg border border-rule bg-paper transition-shadow hover:shadow-md',
        isLead ? 'sm:col-span-2' : '',
      ].join(' ')}
    >
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="block h-full">
        {showImage && article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => {
              setImageFailed(true)
            }}
            className={[
              'w-full bg-canvas object-cover',
              isLead ? 'aspect-[16/9] sm:aspect-[21/9]' : 'aspect-[16/9]',
            ].join(' ')}
          />
        ) : null}

        <div className={isLead ? 'p-4 sm:p-6' : 'p-4'}>
          <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-accent uppercase">
            {article.source}
          </p>

          <h3
            className={[
              'mt-1.5 font-display leading-tight font-bold group-hover:text-accent',
              isLead ? 'text-xl sm:text-3xl' : 'text-lg',
            ].join(' ')}
          >
            {article.title}
          </h3>

          {article.summary ? (
            <p
              className={[
                'mt-2 text-sm text-muted',
                isLead ? 'clamp-3 sm:text-base' : 'clamp-3',
              ].join(' ')}
            >
              {article.summary}
            </p>
          ) : null}

          <Meta article={article} className="mt-3" />
        </div>
      </a>
    </article>
  )
}

function Meta({ article, className = '' }: { readonly article: Article; readonly className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted ${className}`}>
      {article.byline ? (
        <>
          <span className="font-medium">{article.byline}</span>
          <span aria-hidden="true">·</span>
        </>
      ) : null}
      <time dateTime={article.publishedAt}>{timeAgo(article.publishedAt)}</time>
    </p>
  )
}
