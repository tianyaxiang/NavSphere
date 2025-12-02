'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/registry/new-york/ui/button'
import { ScrollArea } from '@/registry/new-york/ui/scroll-area'
import type { NavigationData } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import * as LucideIcons from 'lucide-react'
import { ChevronDown, ChevronRight, X } from 'lucide-react'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  navigationData: NavigationData
  siteInfo: SiteConfig
  onClose?: () => void
}

export function Sidebar({ className, navigationData, siteInfo, onClose }: SidebarProps) {
  const pathname = usePathname()

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      onClose?.()
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    // 先跳转到对应区域
    scrollToSection(categoryId)

    // 如果有子分类，切换展开/收起状态
    const category = navigationData.navigationItems.find(cat => cat.id === categoryId)
    if (category?.subCategories && category.subCategories.length > 0) {
      toggleCategory(categoryId)
    }
  }

  const renderIcon = (iconName?: string) => {
    if (!iconName) return <LucideIcons.Folder className="h-4 w-4" />;

    if (iconName.startsWith('/') || iconName.startsWith('http')) {
      return (
        <Image
          src={iconName}
          alt="icon"
          width={16}
          height={16}
          className="h-4 w-4"
        />
      );
    }

    // Convert icon name to match Lucide icon component name
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Folder;
    return <IconComponent className="h-4 w-4" />;
  }

  // 使用对象存储每个分类的展开状态
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    return navigationData.navigationItems.reduce((acc, category) => {
      acc[category.id] = false
      return acc
    }, {} as Record<string, boolean>)
  })

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  return (
    <div className={cn("w-64 bg-background", className)}>
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {siteInfo.appearance.logo ? (
            <Image
              src={siteInfo.appearance.logo}
              alt={siteInfo.basic.title}
              width={24}
              height={24}
              className="h-6 w-6"
            />
          ) : (
            <LucideIcons.Globe className="h-6 w-6" />
          )}
          <span>{siteInfo.basic.title}</span>
        </Link>
        
        {/* 移动模式下的关闭按钮 */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto sm:hidden"
            onClick={onClose}
            aria-label="关闭侧边栏"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-3.5rem)] px-3 py-2">
        <div className="space-y-1">
          {navigationData.navigationItems.map((category) => (
            <div key={category.id} className="py-2">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  className="flex-1 justify-start gap-2 font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {renderIcon(category.icon)}
                  <span>{category.title}</span>
                </Button>

                {category.subCategories && category.subCategories.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 hover:bg-transparent cursor-pointer"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {expandedCategories[category.id] ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>

              {category.subCategories && category.subCategories.length > 0 && (
                <div
                  className={cn(
                    "mt-1 ml-4 space-y-1 overflow-hidden transition-all duration-200 ease-in-out",
                    expandedCategories[category.id] ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  {category.subCategories.map((subCategory) => (
                    <Button
                      key={subCategory.id}
                      variant="ghost"
                      className="w-full justify-start pl-6 text-sm text-muted-foreground/80 hover:text-foreground cursor-pointer"
                      onClick={() => {
                        scrollToSection(subCategory.id)
                        onClose?.()
                      }}
                    >
                      <span>{subCategory.title}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
