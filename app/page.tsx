export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

import { NavigationContent } from '@/components/navigation-content'
import { headers } from 'next/headers'
import { Metadata, ResolvingMetadata } from 'next/types'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Container } from '@/components/ui/container'


async function getData() {
  try {
    // 使用绝对 URL，确保构建时可以访问
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    console.log('Building with base URL:', baseUrl) // 添加构建日志

    const [navigationRes, siteRes] = await Promise.all([
      fetch(new URL('/api/home/navigation', baseUrl).toString()),
      fetch(new URL('/api/home/site', baseUrl).toString())
    ])

    if (!navigationRes.ok || !siteRes.ok) {
      throw new Error(`Failed to fetch data: Navigation ${navigationRes.status}, Site ${siteRes.status}`)
    }

    const [navigationData, siteData] = await Promise.all([
      navigationRes.json(),
      siteRes.json()
    ])

    // 添加数据验证日志
    console.log('Navigation data received:', !!navigationData)
    console.log('Site data received:', !!siteData)

    return { 
      navigationData: navigationData || { navigationItems: [] }, 
      siteData: siteData || {
        basic: {
          title: 'NavSphere',
          description: '',
          keywords: ''
        },
        appearance: {
          logo: '',
          favicon: '',
          theme: 'system'
        }
      }
    }
  } catch (error) {
    console.error('Error in getData:', error)
    // 返回默认数据而不是空值
    return {
      navigationData: { navigationItems: [] },
      siteData: {
        basic: {
          title: 'NavSphere',
          description: 'Default description',
          keywords: 'default keywords'
        },
        appearance: {
          logo: '',
          favicon: '',
          theme: 'system'
        }
      }
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { siteData } = await getData()
  
  return {
    title: siteData.basic.title,
    description: siteData.basic.description,
    keywords: siteData.basic.keywords,
    icons: {
      icon: siteData.appearance.favicon,
    },
  }
}

export function generateStaticParams() {
  return [{}]
}

export default async function HomePage() {
  const { navigationData, siteData } = await getData()
  
  console.log('Rendering HomePage with data:', { 
    hasNavigation: !!navigationData?.navigationItems,
    hasSiteData: !!siteData?.basic 
  })

  return (
    <Container>
      <NavigationContent navigationData={navigationData} siteData={siteData} />
      <ScrollToTop />
    </Container>
  )
}
