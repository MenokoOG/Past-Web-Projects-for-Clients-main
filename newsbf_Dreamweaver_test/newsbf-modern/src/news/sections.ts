import type { Section, SectionId } from './types'
import { SECTION_IDS } from './types'

/**
 * The desks of News Bonners Ferry, carried forward from the 2012 navigation.
 * `legacyPath` is the file each desk was published from before the rebuild.
 */
export const SECTIONS: readonly Section[] = [
  {
    id: 'front',
    label: 'Front Page',
    blurb: 'Everything happening in Boundary County right now.',
    legacyPath: 'index.html',
  },
  {
    id: 'news',
    label: 'News',
    blurb: 'County government, schools, public safety and the wider world.',
    legacyPath: 'news.html',
  },
  {
    id: 'sports',
    label: 'Sports',
    blurb: 'Badgers athletics and the leagues our readers follow.',
    legacyPath: 'sports.html',
  },
  {
    id: 'events',
    label: 'Events',
    blurb: 'What is on this week — fairs, meetings, music and culture.',
    legacyPath: 'events.html',
  },
  {
    id: 'obituaries',
    label: 'Obituaries',
    blurb: 'Remembering the lives of those we have lost.',
    legacyPath: 'obituaries.html',
  },
  {
    id: 'social',
    label: 'Social',
    blurb: 'Neighbors, milestones, food and family life.',
    legacyPath: 'social.html',
  },
  {
    id: 'letters',
    label: 'Letters',
    blurb: 'Opinion and correspondence from our readers.',
    legacyPath: 'letters.html',
  },
]

const BY_ID = new Map<SectionId, Section>(SECTIONS.map((s) => [s.id, s]))

export function getSection(id: SectionId): Section {
  const section = BY_ID.get(id)
  /* c8 ignore next — SectionId is a closed union, so this cannot happen. */
  if (!section) throw new Error(`Unknown section: ${id}`)
  return section
}

export function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value)
}
