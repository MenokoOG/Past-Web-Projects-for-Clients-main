import { useEffect, useRef, useState } from 'react'
import { useDroid } from './DroidContext'
import { DroidAvatar, type DroidMood } from './DroidAvatar'
import { useTransmissions } from './log'

/**
 * The droid's call button.
 *
 * Anchored to the bottom-right inside the safe area, which is thumb-reachable
 * on a phone and out of the reading column on a desktop. The eyes track the
 * most recent transmission, so the mascot doubles as an ambient status light:
 * green while an exchange is open, red when one has just failed.
 */
export function DroidLauncher() {
  const { isPanelOpen, openPanel } = useDroid()
  const transmissions = useTransmissions()
  const [pulse, setPulse] = useState(false)
  const lastSeen = useRef<string | null>(null)

  const latest = transmissions[0]
  const mood: DroidMood =
    latest?.kind === 'fault' ? 'fault' : latest?.kind === 'handshake' ? 'working' : 'idle'

  // Flash once per new transmission while the panel is closed, so the droid
  // signals that it has something to say without nagging.
  useEffect(() => {
    if (!latest || isPanelOpen) return
    if (lastSeen.current === latest.id) return
    lastSeen.current = latest.id
    setPulse(true)
    const timer = window.setTimeout(() => setPulse(false), 1400)
    return () => {
      window.clearTimeout(timer)
    }
  }, [latest, isPanelOpen])

  if (isPanelOpen) return null

  return (
    <button
      type="button"
      onClick={() => openPanel()}
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex items-center gap-2 rounded-full border-2 border-gold-400 bg-press-700 py-2 pr-4 pl-2 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label="Open NB-3O, the protocol droid"
    >
      <span className="relative flex">
        <DroidAvatar mood={mood} className="h-8 w-8" />
        {pulse ? (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 animate-ping rounded-full bg-gold-400"
          />
        ) : null}
      </span>
      <span className="text-sm font-semibold tracking-wide">NB-3O</span>
    </button>
  )
}
