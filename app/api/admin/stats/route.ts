import { NextResponse } from 'next/server'
import { getFileContent } from '@/lib/github'
import { NavigationCategory } from '@/types/navigation'
export const runtime = 'edge'

export async function GET() {
  try {
    // 动态读取最新的导航数据，而不是静态导入
    const navigationData = await getFileContent('navsphere/content/navigation.json')
    const navigationItems = navigationData.navigationItems || []
    
    // 计算一级分类数量
    const parentCategories = navigationItems.length
    console.log('Parent categories:', parentCategories)

    // 计算二级分类数量
    const subCategories = navigationItems.reduce((total: number, category: any) => {
      return total + (category.subCategories?.length || 0)
    }, 0)

    // 计算总分类数量
    const totalCategories = parentCategories + subCategories

    // 计算站点总数
    const totalSites = navigationItems.reduce((total: number, category: any) => {
      // 一级分类的站点
      const parentSites = category.items?.length || 0
      
      // 二级分类的站点
      const subCategoriesSites = Array.isArray(category.subCategories) 
  ? (category.subCategories as NavigationCategory[]).reduce((sum, subCategory) => {
      return sum + (subCategory.items?.length || 0);
    }, 0)
  : 0;

      return total + parentSites + subCategoriesSites
    }, 0)

    const result = {
      parentCategories,
      subCategories,
      totalCategories,
      totalSites
    }
    
    console.log('Sending stats:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
} 