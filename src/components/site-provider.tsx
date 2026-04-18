'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { SiteConfig } from '@/types/site'

const SiteContext = createContext<{
  siteInfo: SiteConfig | null
  isLoading: boolean
  error: Error | null
}>({
  siteInfo: null,
  isLoading: true,
  error: null,
})

export function useSiteInfo() {
  return useContext(SiteContext)
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [siteInfo, setSiteInfo] = useState<SiteConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadSiteInfo() {
      try {
        const response = await fetch('/api/site-config')
        if (!response.ok) {
          throw new Error('Failed to fetch site config')
        }
        const data = await response.json()
        setSiteInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        // 设置默认值
        setSiteInfo({
          basic: {
            title: 'NavSphere',
            description: 'A modern navigation platform',
            keywords: 'navigation, platform, web, management'
          },
          appearance: {
            logo: '/logo.png',
            favicon: '/favicon.ico',
            theme: 'system'
          },
          navigation: {
            linkTarget: '_blank'
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSiteInfo()
  }, [])

  return (
    <SiteContext.Provider value={{ siteInfo, isLoading, error }}>
      {children}
    </SiteContext.Provider>
  )
}
