import { hrefFor } from '@/hooks/useRouter'

interface Masthead {
  readonly role: string
  readonly name: string
  readonly lines: readonly string[]
  readonly email: string
}

/**
 * The three columns are carried over verbatim from the legacy footer, because
 * the contact details are the part of a local paper that readers actually use.
 * What changed is that they now live in one file instead of being pasted into
 * fourteen, and the year is computed rather than frozen at 2012.
 */
const MASTHEAD: readonly Masthead[] = [
  {
    role: 'Publisher',
    name: 'Mike Weland',
    lines: ['35 Clifty View Road', 'Bonners Ferry, Idaho 83805', '(208) 267-5885'],
    email: 'publisher@newsbf.com',
  },
  {
    role: 'Advertising',
    name: 'Mike Ashby',
    lines: ['122 Maple St.', 'Moyie Springs, ID 83845', '(208) 267-5135'],
    email: 'ashby@newsbf.com',
  },
  {
    role: 'Media Design',
    name: 'Lawrence "Designer J" Jefferson',
    lines: ['Bonners Ferry, ID 83805'],
    email: 'designerj@newsbf.com',
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t-4 border-press-700 bg-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {MASTHEAD.map((entry) => (
          <section key={entry.email}>
            <h2 className="text-[0.68rem] font-semibold tracking-[0.2em] text-muted uppercase">
              {entry.role}
            </h2>
            <p className="mt-2 font-display text-lg font-semibold">{entry.name}</p>
            <address className="mt-1 space-y-0.5 text-sm text-muted not-italic">
              {entry.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <a
              href={`mailto:${entry.email}`}
              className="mt-2 inline-block text-sm font-medium text-accent underline underline-offset-4 hover:text-flag-500"
            >
              {entry.email}
            </a>
          </section>
        ))}
      </div>

      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} newsbf.com · Dedicated to the people of Boundary
            County, Idaho.
          </p>
          <a
            href={hrefFor({ name: 'about' })}
            className="font-medium text-accent underline underline-offset-4 hover:text-flag-500"
          >
            About this rebuild
          </a>
        </div>
      </div>
    </footer>
  )
}
