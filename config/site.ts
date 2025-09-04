import type { SiteConfig } from '@/types/site'

export const siteConfig: SiteConfig = {
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
}

export function getSiteConfig(): SiteConfig {
  return siteConfig
}
