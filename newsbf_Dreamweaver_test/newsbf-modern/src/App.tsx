import { useRouter } from '@/hooks/useRouter'
import { DroidProvider, useDroid } from '@/droid/DroidContext'
import { DroidLauncher } from '@/droid/DroidLauncher'
import { DroidPanel } from '@/droid/DroidPanel'
import { LegacyGuide } from '@/droid/LegacyGuide'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { SectionPage } from '@/pages/SectionPage'
import { AboutPage } from '@/pages/AboutPage'

export default function App() {
  return (
    <DroidProvider>
      <Paper />
    </DroidProvider>
  )
}

function Paper() {
  const { route } = useRouter()
  const { isPanelOpen } = useDroid()
  const activeSectionId = route.name === 'section' ? route.sectionId : null

  return (
    <div className="flex min-h-full flex-col">
      {/* The legacy build put seven navigation links before the first headline
          with no way past them. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-press-700 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to the news
      </a>

      <SiteHeader />
      <SiteNav activeSectionId={activeSectionId} />

      <div
        className={[
          'flex-1 transition-[padding] duration-200',
          // The desktop side rail sits beside the paper rather than over it.
          isPanelOpen ? 'lg:pr-[26rem]' : '',
        ].join(' ')}
      >
        {route.name === 'about' ? (
          <AboutPage />
        ) : (
          <SectionPage key={route.sectionId} sectionId={route.sectionId} />
        )}
      </div>

      <SiteFooter />

      <LegacyGuide />
      <DroidLauncher />
      <DroidPanel sectionId={activeSectionId ?? 'front'} />
    </div>
  )
}
