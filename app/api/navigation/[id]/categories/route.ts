import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { commitFile, getFileContent } from '@/lib/github'
import type { NavigationData, NavigationItem } from '@/types/navigation'

export const runtime = 'edge'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.accessToken) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { categoryId } = await request.json()
    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const data = await getFileContent('navsphere/content/navigation.json') as NavigationData
    
    const navigation = data.navigationItems.find(nav => nav.id === id)
    if (!navigation) {
      return NextResponse.json({ error: 'Navigation not found' }, { status: 404 })
    }

    // 检查分类是否存在
    const categoryExists = navigation.subCategories?.some(cat => cat.id === categoryId)
    if (!categoryExists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // 删除指定的分类
    const updatedSubCategories = navigation.subCategories?.filter(cat => cat.id !== categoryId) || []

    const updatedNavigations = data.navigationItems.map(nav => {
      if (nav.id === id) {
        return {
          ...nav,
          subCategories: updatedSubCategories
        }
      }
      return nav
    })

    await commitFile(
      'navsphere/content/navigation.json',
      JSON.stringify({ navigationItems: updatedNavigations }, null, 2),
      `Delete category: ${categoryId}`,
      session.user.accessToken
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}