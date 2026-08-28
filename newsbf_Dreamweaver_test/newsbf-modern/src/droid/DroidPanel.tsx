import { useEffect, useRef } from 'react'
import type { SectionId } from '@/news/types'
import { useDroid, type DroidTab } from './DroidContext'
import { DroidAvatar } from './DroidAvatar'
import { LedgerTab } from './LedgerTab'
import { ProtocolsTab } from './ProtocolsTab'
import { LogTab } from './LogTab'
import { useTransmissions } from './log'
import { LEDGER } from './ledger'
import { PROVIDERS } from '@/news/registry'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const TABS: readonly { readonly id: DroidTab; readonly label: string }[] = [
  { id: 'ledger', label: 'Ledger' },
  { id: 'protocols', label: 'Protocols' },
  { id: 'log', label: 'Log' },
]

interface DroidPanelProps {
  readonly sectionId: SectionId
}

/**
 * The protocol droid's interface.
 *
 * Mobile-first in structure, not only in styling: below the lg breakpoint this
 * is a modal bottom sheet with a backdrop and Escape-to-dismiss, because that
 * is the correct pattern for a thumb on a phone. At lg and above the same
 * component becomes a non-modal side rail that sits beside the paper, because
 * a desktop reader should be able to change protocol and watch the page
 * re-render at the same time.
 */
export function DroidPanel({ sectionId }: DroidPanelProps) {
  const { isPanelOpen, closePanel, tab, setTab } = useDroid()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const panelRef = useRef<HTMLDivElement>(null)
  const transmissions = useTransmissions()

  useEffect(() => {
    if (!isPanelOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isPanelOpen, closePanel])

  useEffect(() => {
    if (isPanelOpen) panelRef.current?.focus()
  }, [isPanelOpen])

  // A modal sheet must not leave the page scrolling behind it; a side rail
  // must not lock it.
  useEffect(() => {
    if (!isPanelOpen || isDesktop) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isPanelOpen, isDesktop])

  if (!isPanelOpen) return null

  const counts: Readonly<Record<DroidTab, number>> = {
    ledger: LEDGER.length,
    protocols: PROVIDERS.length,
    log: transmissions.length,
  }

  return (
    <>
      {!isDesktop ? (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px]"
          onClick={closePanel}
          aria-hidden="true"
        />
      ) : null}

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label="NB-3O protocol droid"
        {...(isDesktop ? {} : { 'aria-modal': true })}
        className={[
          'fixed z-50 flex flex-col bg-paper shadow-2xl outline-none',
          isDesktop
            ? 'top-0 right-0 h-full w-[26rem] border-l border-rule'
            : 'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl border-t-4 border-gold-400',
        ].join(' ')}
      >
        {!isDesktop ? (
          <div className="flex justify-center pt-2" aria-hidden="true">
            <span className="h-1 w-10 rounded-full bg-rule" />
          </div>
        ) : null}

        <header className="flex items-start gap-3 px-4 py-3">
          <DroidAvatar mood="idle" className="h-10 w-10 shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg leading-none font-bold">NB-3O</h2>
            <p className="mt-1 text-xs text-muted">
              Protocol droid · newsroom modernization &amp; wire translation
            </p>
          </div>
          <button
            type="button"
            onClick={closePanel}
            className="-mt-1 -mr-1 rounded p-2 text-xl leading-none text-muted transition-colors hover:text-flag-500"
            aria-label="Close the protocol droid panel"
          >
            &times;
          </button>
        </header>

        <div role="tablist" aria-label="Droid functions" className="flex border-b border-rule px-2">
          {TABS.map((entry) => {
            const isActive = entry.id === tab
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(entry.id)}
                className={[
                  '-mb-px flex-1 border-b-2 px-2 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-press-700 text-accent'
                    : 'border-transparent text-muted hover:text-body',
                ].join(' ')}
              >
                {entry.label}
                <span className="ml-1.5 text-[0.65rem] text-muted">{counts[entry.id]}</span>
              </button>
            )
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {tab === 'ledger' ? <LedgerTab /> : null}
          {tab === 'protocols' ? <ProtocolsTab sectionId={sectionId} /> : null}
          {tab === 'log' ? <LogTab /> : null}
        </div>
      </div>
    </>
  )
}
