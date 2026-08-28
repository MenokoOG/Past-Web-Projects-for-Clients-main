const RELATIVE = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })
const ABSOLUTE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const WITH_TIME = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const DIVISIONS: readonly { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]

/** "3 hours ago" for fresh copy, falling back to a date once it is stale. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ''

  let delta = (then.getTime() - now.getTime()) / 1000
  for (const division of DIVISIONS) {
    if (Math.abs(delta) < division.amount) {
      return RELATIVE.format(Math.round(delta), division.unit)
    }
    delta /= division.amount
  }
  return ABSOLUTE.format(then)
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : ABSOLUTE.format(date)
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : WITH_TIME.format(date)
}

export function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-US', { hour12: false })
}
