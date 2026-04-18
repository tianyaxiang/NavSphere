import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/registry/new-york/ui/card'
import { Icons } from '@/components/icons'
import type { NavigationSubItem } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavigationCardProps {
  item: NavigationSubItem
  siteConfig?: SiteConfig
}

export function NavigationCard({ item, siteConfig }: NavigationCardProps) {
  const isExternalIcon = item.icon?.startsWith('http')
  const isLocalIcon = item.icon && !isExternalIcon

  const iconPath = isLocalIcon && item.icon
    ? item.icon.startsWith('/') 
      ? item.icon 
      : `/${item.icon}`
    : item.icon || '/placeholder-icon.png'

  // 获取链接打开方式，默认为新窗口
  const linkTarget = siteConfig?.navigation?.linkTarget || '_blank'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg">
            <Link
              href={item.href}
              target={linkTarget}
              rel="noopener noreferrer"
              className="block h-full"
            >
              <CardHeader>
                <div className="flex items-start gap-2 sm:gap-4">
                  {item.icon && (
                    <div className="flex-shrink-0 w-8 h-8 sm:w-11 sm:h-11">
                      <img
                        src={item.icon}
                        alt={`${item.title} icon`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="space-y-0.5 sm:space-y-1">
                    <CardTitle className="text-sm sm:text-base">{item.title}</CardTitle>
                    {item.description && (
                      <CardDescription className="text-xs sm:text-sm line-clamp-1">
                        {item.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          align="center"
          sideOffset={8}
          className="max-w-[280px] text-xs sm:text-sm"
        >
          <p>{item.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
