import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ProviderId } from '@/news/types'
import { DEFAULT_PROVIDER_ID, getProvider, isProviderId } from '@/news/registry'
import { clearCache } from '@/news/client'
import { record } from './log'

export type DroidTab = 'ledger' | 'protocols' | 'log'

interface DroidState {
  /** Which upstream protocol the droid is currently speaking. */
  readonly providerId: ProviderId
  readonly selectProvider: (id: ProviderId) => void
  readonly isPanelOpen: boolean
  readonly openPanel: (tab?: DroidTab) => void
  readonly closePanel: () => void
  readonly tab: DroidTab
  readonly setTab: (tab: DroidTab) => void
  /** Overlays the legacy 1000px canvas so the two layouts can be compared. */
  readonly showLegacyGuide: boolean
  readonly toggleLegacyGuide: () => void
  readonly purgeMemory: () => void
}

const DroidStateContext = createContext<DroidState | null>(null)

const STORAGE_KEY = 'newsbf.droid.provider'

function initialProvider(): ProviderId {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && isProviderId(stored) && getProvider(stored).unavailableReason() === null) {
      return stored
    }
  } catch {
    // Private browsing and blocked site data both throw here. A remembered
    // provider is a convenience, never a requirement.
  }
  return DEFAULT_PROVIDER_ID
}

export function DroidProvider({ children }: { children: ReactNode }) {
  const [providerId, setProviderId] = useState<ProviderId>(initialProvider)
  const [isPanelOpen, setPanelOpen] = useState(false)
  const [tab, setTab] = useState<DroidTab>('ledger')
  const [showLegacyGuide, setShowLegacyGuide] = useState(false)

  const selectProvider = useCallback((id: ProviderId) => {
    setProviderId((current) => {
      if (current === id) return current
      const next = getProvider(id)
      record({
        kind: 'handshake',
        headline: `Switching protocol to ${next.label}.`,
        detail: `${getProvider(current).label} → ${next.label}. The reading experience does not change; only the dialect behind it does.`,
        providerId: id,
      })
      try {
        window.localStorage.setItem(STORAGE_KEY, id)
      } catch {
        // Non-fatal: the choice simply will not survive a reload.
      }
      return id
    })
  }, [])

  const openPanel = useCallback((next?: DroidTab) => {
    if (next) setTab(next)
    setPanelOpen(true)
  }, [])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  const toggleLegacyGuide = useCallback(() => {
    setShowLegacyGuide((current) => {
      record({
        kind: 'translate',
        headline: current ? 'Legacy canvas guide hidden.' : 'Legacy canvas guide shown.',
        detail: current
          ? 'Returning to the responsive layout without overlay.'
          : 'Overlaying the 1000px fixed canvas the 2012 build was locked to, for comparison against the current viewport.',
      })
      return !current
    })
  }, [])

  const purgeMemory = useCallback(() => {
    clearCache()
  }, [])

  const value = useMemo<DroidState>(
    () => ({
      providerId,
      selectProvider,
      isPanelOpen,
      openPanel,
      closePanel,
      tab,
      setTab,
      showLegacyGuide,
      toggleLegacyGuide,
      purgeMemory,
    }),
    [
      providerId,
      selectProvider,
      isPanelOpen,
      openPanel,
      closePanel,
      tab,
      showLegacyGuide,
      toggleLegacyGuide,
      purgeMemory,
    ],
  )

  return <DroidStateContext.Provider value={value}>{children}</DroidStateContext.Provider>
}

export function useDroid(): DroidState {
  const context = useContext(DroidStateContext)
  if (!context) throw new Error('useDroid must be used inside a DroidProvider')
  return context
}
