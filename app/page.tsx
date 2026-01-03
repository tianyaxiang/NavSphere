import { NavigationContent } from '@/components/navigation-content'
import { Metadata } from 'next/types'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Container } from '@/components/ui/container'
import type { SiteConfig } from '@/types/site'
import navigationData from '@/navsphere/content/navigation.json'
import siteDataRaw from '@/navsphere/content/site.json'

function getData() {
  // 确保 theme 类型正确
  const siteData: SiteConfig = {
    ...siteDataRaw,
    appearance: {
      ...siteDataRaw.appearance,
      theme: (siteDataRaw.appearance.theme === 'light' ||
        siteDataRaw.appearance.theme === 'dark' ||
        siteDataRaw.appearance.theme === 'system')
        ? siteDataRaw.appearance.theme
        : 'system'
    },
    navigation: {
      linkTarget: (siteDataRaw.navigation?.linkTarget === '_blank' ||
        siteDataRaw.navigation?.linkTarget === '_self')
        ? siteDataRaw.navigation.linkTarget
        : '_blank'
    }
  }

  // 过滤只显示启用的分类和网站
  const filteredNavigationData = {
    navigationItems: navigationData.navigationItems
      .filter(category => (category as any).enabled !== false) // 过滤启用的分类
      .map(category => {
        const filteredSubCategories = category.subCategories
          ? (category.subCategories as any[])
              .filter(sub => sub.enabled !== false) // 过滤启用的子分类
              .map(sub => ({
                ...sub,
                items: sub.items?.filter((item: any) => item.enabled !== false) // 过滤启用的网站
              }))
          : undefined
        
        return {
          ...category,
          items: category.items?.filter(item => item.enabled !== false), // 过滤启用的网站
          subCategories: filteredSubCategories
        }
      })
  }

  return {
    navigationData: filteredNavigationData || { navigationItems: [] },
    siteData: siteData || {
      basic: {
        title: 'NavSphere',
        description: '',
        keywords: ''
      },
      appearance: {
        logo: '',
        favicon: '',
        theme: 'system' as const
      },
      navigation: {
        linkTarget: '_blank' as const
      }
    }
  }
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
