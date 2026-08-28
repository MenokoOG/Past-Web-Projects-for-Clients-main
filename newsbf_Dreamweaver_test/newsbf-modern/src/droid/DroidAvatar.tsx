export type DroidMood = 'idle' | 'working' | 'fault'

interface DroidAvatarProps {
  readonly mood?: DroidMood
  readonly className?: string
  readonly title?: string
}

const EYE: Readonly<Record<DroidMood, string>> = {
  idle: '#0000cc',
  working: '#22c55e',
  fault: '#cc0033',
}

/**
 * NB-3O, drawn rather than downloaded.
 *
 * Inline SVG keeps the mascot at one request, zero bytes of image payload, and
 * infinitely sharp on any display — the same argument that retires the legacy
 * build's 640x190 masthead JPEG and its GIF social icons.
 */
export function DroidAvatar({ mood = 'idle', className = '', title }: DroidAvatarProps) {
  const eye = EYE[mood]

  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role={title ? 'img' : 'presentation'}
      {...(title ? { 'aria-label': title } : { 'aria-hidden': true })}
    >
      <defs>
        <linearGradient id="nb3o-plating" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9b0" />
          <stop offset="45%" stopColor="#ffcc33" />
          <stop offset="100%" stopColor="#c88b06" />
        </linearGradient>
      </defs>

      {/* Auditory sensors */}
      <rect x="4" y="19" width="5" height="11" rx="2.5" fill="url(#nb3o-plating)" />
      <rect x="39" y="19" width="5" height="11" rx="2.5" fill="url(#nb3o-plating)" />

      {/* Cranial dome */}
      <path
        d="M24 3c9.4 0 15 6.6 15 16v13c0 8-6 12-15 12S9 40 9 32V19C9 9.6 14.6 3 24 3Z"
        fill="url(#nb3o-plating)"
        stroke="#a8740a"
        strokeWidth="1.1"
      />

      {/* Brow plate */}
      <path d="M11 18.5h26" stroke="#a8740a" strokeWidth="1.1" strokeLinecap="round" />

      {/* Photoreceptors */}
      <circle cx="17.5" cy="24" r="5" fill="#2a1c00" />
      <circle cx="30.5" cy="24" r="5" fill="#2a1c00" />
      <circle cx="17.5" cy="24" r="2.6" fill={eye}>
        {mood === 'working' ? (
          <animate attributeName="opacity" values="1;0.35;1" dur="1.1s" repeatCount="indefinite" />
        ) : null}
      </circle>
      <circle cx="30.5" cy="24" r="2.6" fill={eye}>
        {mood === 'working' ? (
          <animate
            attributeName="opacity"
            values="0.35;1;0.35"
            dur="1.1s"
            repeatCount="indefinite"
          />
        ) : null}
      </circle>

      {/* Vocoder grille */}
      <rect x="17" y="33" width="14" height="7" rx="2" fill="#2a1c00" />
      <g stroke="#ffcc33" strokeWidth="0.9" strokeLinecap="round" opacity="0.75">
        <path d="M19.5 35v3" />
        <path d="M22.3 35v3" />
        <path d="M25.1 35v3" />
        <path d="M27.9 35v3" />
      </g>
    </svg>
  )
}
