import { NextResponse } from 'next/server'
import { getFileContent } from '@/lib/github'
import type { NavigationData } from '@/types/navigation'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const { resourcePaths } = await request.json()
    
    if (!Array.isArray(resourcePaths)) {
      return NextResponse.json({ error: 'Invalid resource paths' }, { status: 400 })
    }

    // 获取导航数据
    const navigationData = await getFileContent('navsphere/content/navigation.json') as NavigationData
    
    // 获取站点配置数据
    const siteData = await getFileContent('navsphere/content/site.json') as any
    
    const references: Record<string, Array<{ type: string; location: string; title?: string }>> = {}
    
    // 检查每个资源路径的引用
    for (const resourcePath of resourcePaths) {
      references[resourcePath] = []
      
      // 检查导航数据中的引用
      if (navigationData?.navigationItems) {
        for (const navItem of navigationData.navigationItems) {
          // 检查主导航项的图标
          if (navItem.icon === resourcePath) {
            references[resourcePath].push({
              type: 'navigation',
              location: `导航项: ${navItem.title}`,
              title: navItem.title
            })
          }
          
          // 检查导航项中的子项
          if (navItem.items) {
            for (const subItem of navItem.items) {
              if (subItem.icon === resourcePath) {
                references[resourcePath].push({
                  type: 'navigation',
                  location: `导航子项: ${navItem.title} > ${subItem.title}`,
                  title: subItem.title
                })
              }
            }
          }
          
          // 检查子分类
          if (navItem.subCategories) {
            for (const subCategory of navItem.subCategories) {
              if (subCategory.icon === resourcePath) {
                references[resourcePath].push({
                  type: 'navigation',
                  location: `导航分类: ${navItem.title} > ${subCategory.title}`,
                  title: subCategory.title
                })
              }
              
              // 检查子分类中的项目
              if (subCategory.items) {
                for (const item of subCategory.items) {
                  if (item.icon === resourcePath) {
                    references[resourcePath].push({
                      type: 'navigation',
                      location: `导航项: ${navItem.title} > ${subCategory.title} > ${item.title}`,
                      title: item.title
                    })
                  }
                }
              }
            }
          }
        }
      }
      
      // 检查站点配置中的引用
      if (siteData?.appearance) {
        if (siteData.appearance.logo === resourcePath) {
          references[resourcePath].push({
            type: 'site',
            location: '站点Logo',
            title: '站点Logo'
          })
        }
        
        if (siteData.appearance.favicon === resourcePath) {
          references[resourcePath].push({
            type: 'site',
            location: '站点图标',
            title: '站点图标'
          })
        }
      }
    }
    
    return NextResponse.json({ references })
  } catch (error) {
    console.error('Failed to check resource references:', error)
    return NextResponse.json({ error: 'Failed to check resource references' }, { status: 500 })
  }
}