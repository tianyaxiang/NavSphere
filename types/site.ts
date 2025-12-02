export interface SiteConfig {
  basic: {
    title: string
    description: string
    keywords: string
  }
  appearance: {
    logo: string
    favicon: string
    theme: 'light' | 'dark' | 'system'
  }
  navigation: {
    linkTarget: '_blank' | '_self'
  }
}

export interface SiteInfo {
  basic: {
    title: string
    description: string
    keywords: string
  }
  appearance: {
    logo: string
    favicon: string
    theme: string
  }
  navigation: {
    linkTarget: string
  }
} 