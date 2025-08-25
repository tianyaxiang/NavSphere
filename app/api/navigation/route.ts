import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { commitFile, getFileContent } from '@/lib/github'
import type { NavigationData, NavigationItem } from '@/types/navigation'

export const runtime = 'edge'

export async function GET() {
  try {
    const data = await getFileContent('navsphere/content/navigation.json')
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch navigation data:', error)
    // 返回默认数据结构
    return NextResponse.json({
      navigationItems: []
    })
  }
}

async function validateAndSaveNavigationData(data: any, accessToken: string) {
  // 详细的数据结构验证和日志
  console.log('Received navigation data:', JSON.stringify(data, null, 2))
  
  // 严格验证数据结构
  if (!data || typeof data !== 'object') {
    console.error('Invalid data: not an object')
    throw new Error('Invalid navigation data: not an object')
  }

  if (!('navigationItems' in data)) {
    console.error('Missing navigationItems key')
    throw new Error('Invalid navigation data: missing navigationItems')
  }

  if (!Array.isArray(data.navigationItems)) {
    console.error('navigationItems is not an array', typeof data.navigationItems)
    throw new Error('Invalid navigation data: navigationItems must be an array')
  }

  // 额外的数据验证
  const invalidItems = data.navigationItems.filter((item: NavigationItem) => 
    !item.id || 
    !item.title || 
    (item.items && !Array.isArray(item.items)) ||
    (item.subCategories && !Array.isArray(item.subCategories))
  )

  if (invalidItems.length > 0) {
    console.error('Invalid navigation items:', invalidItems)
    throw new Error('Invalid navigation data: some items are malformed')
  }

  await commitFile(
    'navsphere/content/navigation.json',
    JSON.stringify(data, null, 2),
    'Update navigation data',
    accessToken
  )
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.accessToken) {
      return new Response('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    await validateAndSaveNavigationData(data, session.user.accessToken)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save navigation data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save navigation data', 
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.accessToken) {
      return new Response('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    await validateAndSaveNavigationData(data, session.user.accessToken)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update navigation data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update navigation data', 
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
} 