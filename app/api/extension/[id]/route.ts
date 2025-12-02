import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { commitFile, getFileContent } from '@/lib/github'
import type { NavigationData, NavigationItem } from '@/types/navigation'

export const runtime = 'edge'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.accessToken) {
      return new Response('Unauthorized', { status: 401 })
    }

    const updatedItem: NavigationItem = await request.json()
    const data = await getFileContent('navsphere/content/navigation.json') as NavigationData
    
    // 确保更新的导航项包含所有必需的字段
    const existingItem = data.navigationItems.find(item => item.id === id)
    if (!existingItem) {
      return new Response('Navigation item not found', { status: 404 })
    }

    // 更新导航项，保持原有的 ID
    const mergedItem: NavigationItem = {
      ...existingItem,
      ...updatedItem,
      id: id,
      items: updatedItem.items || existingItem.items || [],
      subCategories: [
        ...(
          [
            ...(existingItem.subCategories || []),
            ...(updatedItem.subCategories || [])
          ].reduce((acc, sub) => {
            const exist = acc.get(sub.id);
            acc.set(sub.id, {
              ...exist,
              ...sub,
              items: [
                ...(exist?.items || []),
                ...(sub.items || [])
              ]            });
            return acc;
          }, new Map<string, NavigationItem>())
        ).values()
      ]   
     }

    const updatedItems = data.navigationItems.map(item => 
      item.id === id ? mergedItem : item
    )

    await commitFile(
      'navsphere/content/navigation.json',
      JSON.stringify({ navigationItems: updatedItems }, null, 2),
      'Update navigation item',
      session.user.accessToken
    )

    return NextResponse.json(mergedItem)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: 'Failed to update navigation' }, { status: 500 })
  }
}