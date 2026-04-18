import Link from 'next/link'
import { Icons } from '@/components/icons'
import type { SiteConfig } from '@/types/site'

interface FooterProps {
  siteInfo: SiteConfig
}

export function Footer({ siteInfo }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center gap-4 md:h-16 md:flex-row md:justify-center">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            {currentYear} {siteInfo.basic.title}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
