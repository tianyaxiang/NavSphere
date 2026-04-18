import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { commitFile, getFileContent } from '@/lib/github'
import type { NavigationData, NavigationItem } from '@/types/navigation'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.accessToken) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { sourceIndex, destinationIndex, itemId } = await request.json()

    // 获取当前导航数据
    const data = await getFileContent('src/navsphere/content/navigation.json') as NavigationData

    // 确保导航项存在
    if (!data.navigationItems || !Array.isArray(data.navigationItems)) {
      throw new Error('无效的导航数据')
    }

    // 创建新的导航项数组副本
    const updatedItems = [...data.navigationItems]

    // 找到要移动的项目
    const [movedItem] = updatedItems.splice(sourceIndex, 1)

    // 将项目插入到新位置
    updatedItems.splice(destinationIndex, 0, movedItem)

    // 更新数据
    data.navigationItems = updatedItems

    // 提交更改到 GitHub
    await commitFile(
      'src/navsphere/content/navigation.json',
      JSON.stringify(data, null, 2),
      `重新排序导航项 - ${new Date().toISOString()}`,
      session.user.accessToken
    )

    return NextResponse.json(data.navigationItems, { status: 200 })
  } catch (error) {
    console.error('重新排序导航项错误:', error)
    return NextResponse.json({
      error: '重新排序导航项失败',
      details: (error as Error).message
    }, { status: 500 })
  }
}
