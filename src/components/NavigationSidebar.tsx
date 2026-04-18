'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import { NavigationItem } from './NavigationItem'
import type { NavigationItem as NavigationItemType, NavigationSubItem } from '@/types/navigation'

interface NavigationSidebarProps {
  navigationItems: NavigationItemType[]
}

export function NavigationSidebar({ navigationItems }: NavigationSidebarProps) {
  return (
    <div className="pb-12 hidden lg:block">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            导航菜单
          </h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              <ul className="px-2">
                {navigationItems.map((item) => (
                  <NavigationItem
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    icon={item.icon}
                    items={item.items}
                  />
                ))}
              </ul>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
} 