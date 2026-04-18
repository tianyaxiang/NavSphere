import { NavigationContent } from '@/components/navigation-content'
import { Metadata } from 'next/types'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Container } from '@/components/ui/container'
import type { SiteConfig } from '@/types/site'
import navigationData from '@/navsphere/content/navigation.json'
import siteDataRaw from '@/navsphere/content/site.json'

import { getProcessedData } from '@/lib/data-loader'

function getData() {
  return getProcessedData(navigationData, siteDataRaw)
}

export function generateMetadata(): Metadata {
  const { siteData } = getData()

  return {
    title: siteData.basic.title,
    description: siteData.basic.description,
    keywords: siteData.basic.keywords,
    icons: {
      icon: siteData.appearance.favicon,
    },
  }
}

export default function HomePage() {
  const { navigationData, siteData } = getData()

  return (
    <Container>
      <NavigationContent navigationData={navigationData} siteData={siteData} />
      <ScrollToTop />
    </Container>
  )
}
