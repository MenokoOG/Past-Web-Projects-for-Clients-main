import { USE_CASES } from '@/droid/useCases'
import { LEDGER } from '@/droid/ledger'
import { PROVIDERS } from '@/news/registry'
import { DroidAvatar } from '@/droid/DroidAvatar'
import { useDroid } from '@/droid/DroidContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PageShell } from '@/components/PageShell'

/**
 * The use cases, rendered from the same data the build is specified by.
 *
 * Publishing the specification inside the product is deliberate. It is the
 * page a stakeholder is sent to when they ask what was actually bought.
 */
export function AboutPage() {
  const { openPanel } = useDroid()
  useDocumentTitle('About this rebuild')

  return (
    <PageShell>
      <article className="measure">
        <header className="border-b-2 border-press-700 pb-4">
          <div className="flex items-center gap-3">
            <DroidAvatar mood="idle" className="h-12 w-12 shrink-0" />
            <div>
              <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-accent uppercase">
                Protocol droid NB-3O
              </p>
              <h1 className="mt-0.5 font-display text-2xl leading-tight font-bold sm:text-3xl">
                Modernizing News Bonners Ferry
              </h1>
            </div>
          </div>

          <p className="mt-4 leading-relaxed text-muted">
            This is a working rebuild of a newspaper site authored in Dreamweaver in 2012 — XHTML
            Transitional, a 1000px fixed canvas, three floated columns, editable regions belonging
            to a content management service that no longer exists, and a Google Analytics tag that
            was switched off in 2023. The rebuild is TypeScript and Tailwind, mobile-first, with
            live articles from a free news API.
          </p>

          <p className="mt-3 leading-relaxed text-muted">
            NB-3O is the protocol droid that performed the translation and now explains it. It
            holds {LEDGER.length} findings from the audit of the original build, speaks{' '}
            {PROVIDERS.length} news protocols, and narrates every exchange it makes on your
            behalf.
          </p>

          <button
            type="button"
            onClick={() => openPanel('ledger')}
            className="mt-4 rounded bg-press-700 px-4 py-2.5 text-sm font-bold text-gold-300 transition-colors hover:bg-press-800 hover:text-gold-400"
          >
            Open NB-3O
          </button>
        </header>

        <section className="mt-8">
          <h2 className="font-display text-xl font-bold">Use cases</h2>
          <p className="mt-1 text-sm text-muted">
            What the droid is for, stated as the scenarios it has to satisfy.
          </p>

          <ol className="mt-5 space-y-6">
            {USE_CASES.map((useCase) => (
              <li key={useCase.id} className="rounded-lg border border-rule bg-paper p-4 sm:p-5">
                <p className="font-mono text-xs font-bold tracking-wider text-accent">
                  {useCase.id}
                </p>
                <h3 className="mt-1 font-display text-lg leading-snug font-bold">
                  {useCase.title}
                </h3>

                <dl className="mt-3 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[6rem_minmax(0,1fr)]">
                  <dt className="font-semibold text-muted">Actor</dt>
                  <dd>{useCase.actor}</dd>
                  <dt className="font-semibold text-muted">Goal</dt>
                  <dd>{useCase.goal}</dd>
                </dl>

                <Block title="Preconditions">
                  <ul className="list-disc space-y-1 pl-5">
                    {useCase.preconditions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Block>

                <Block title="Main flow">
                  <ol className="list-decimal space-y-1 pl-5">
                    {useCase.mainFlow.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </Block>

                {useCase.alternateFlows.length > 0 ? (
                  <Block title="Alternate flows">
                    <ul className="space-y-2">
                      {useCase.alternateFlows.map((flow) => (
                        <li key={flow.when}>
                          <span className="font-semibold">If</span> {flow.when}{' '}
                          <span className="font-semibold">Then</span> {flow.then}
                        </li>
                      ))}
                    </ul>
                  </Block>
                ) : null}

                <Block title="Postconditions">
                  <ul className="list-disc space-y-1 pl-5">
                    {useCase.postconditions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Block>

                <p className="mt-4 border-l-2 border-gold-400 pl-3 text-sm leading-relaxed text-muted italic">
                  {useCase.value}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </article>
    </PageShell>
  )
}

function Block({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h4 className="text-[0.65rem] font-semibold tracking-[0.16em] text-muted uppercase">
        {title}
      </h4>
      <div className="mt-1.5 text-sm leading-relaxed">{children}</div>
    </div>
  )
}
