import type { SectionId } from '@/news/types'
import { getSection } from '@/news/sections'
import { getProvider } from '@/news/registry'
import { useArticles } from '@/hooks/useArticles'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useDroid } from '@/droid/DroidContext'
import { PageShell } from '@/components/PageShell'
import { ArticleGrid, ArticleGridSkeleton } from '@/components/ArticleGrid'
import { DeskDigest } from '@/components/DeskDigest'
import { DroidCallout } from '@/components/DroidCallout'

interface SectionPageProps {
  readonly sectionId: SectionId
}

export function SectionPage({ sectionId }: SectionPageProps) {
  const section = getSection(sectionId)
  const { providerId, openPanel } = useDroid()
  const { status, articles, error, fromCache, servedBy, refresh } = useArticles(
    sectionId,
    providerId,
  )

  useDocumentTitle(section.id === 'front' ? '' : section.label)

  const servingProvider = getProvider(servedBy ?? providerId)
  const isFront = sectionId === 'front'

  const aside = (
    <>
      <DroidCallout />
      {isFront ? (
        <>
          <DeskDigest sectionId="obituaries" providerId={providerId} />
          <DeskDigest sectionId="letters" providerId={providerId} />
        </>
      ) : null}
    </>
  )

  return (
    <PageShell aside={aside}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b-2 border-press-700 pb-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl leading-tight font-bold sm:text-3xl">
            {section.label}
          </h1>
          <p className="mt-1 max-w-prose text-sm text-muted">{section.blurb}</p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="shrink-0 rounded border border-rule px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
        >
          Refresh
        </button>
      </div>

      <p className="mb-4 text-xs text-muted">
        Wire:{' '}
        <button
          type="button"
          onClick={() => openPanel('protocols')}
          className="font-medium text-accent underline underline-offset-2"
        >
          {servingProvider.label}
        </button>
        {servedBy && servedBy !== providerId
          ? ' · answering after the selected source failed'
          : null}
        {fromCache ? ' · served from memory' : null}
      </p>

      {status === 'loading' ? <ArticleGridSkeleton count={isFront ? 7 : 6} /> : null}

      {status === 'error' ? (
        <div className="rounded-lg border border-flag-500/40 bg-flag-500/5 p-4">
          <h2 className="font-display text-lg font-semibold">This desk is unreachable.</h2>
          <p className="mt-1 text-sm text-muted">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-3 rounded bg-press-700 px-3 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      ) : null}

      {status === 'ready' && articles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-rule px-4 py-10 text-center text-sm text-muted">
          Nothing has been filed to this desk yet today.
        </p>
      ) : null}

      {status === 'ready' && articles.length > 0 ? (
        <ArticleGrid articles={articles} leadFirst={isFront} />
      ) : null}
    </PageShell>
  )
}
