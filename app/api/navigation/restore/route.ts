import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { commitFile, getFileContent } from '@/lib/github'

export const runtime = 'edge'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.accessToken) {
      return new Response('Unauthorized', { status: 401 })
    }

    // 检查默认数据文件是否存在
    try {
      const defaultData = await getFileContent('navsphere/content/navigation-default.json')
      
      // 验证默认数据格式
      if (!defaultData || typeof defaultData !== 'object' || !defaultData.navigationItems) {
        return NextResponse.json(
          { 
            error: 'Invalid default data format', 
            details: 'navigation-default.json does not contain valid navigation data' 
          },
          { status: 400 }
        )
      }
      
      // 将默认数据写入到navigation.json
      await commitFile(
        'navsphere/content/navigation.json',
        JSON.stringify(defaultData, null, 2),
        'Restore navigation data to default',
        session.user.accessToken
      )

      return NextResponse.json(defaultData)
    } catch (fileError) {
      // 检查是否是文件不存在的错误
      if ((fileError as Error).message.includes('404') || (fileError as Error).message.includes('not found')) {
        return NextResponse.json(
          { 
            error: 'Default data file not found', 
            details: 'navigation-default.json file does not exist in the repository' 
          },
          { status: 404 }
        )
      }
      throw fileError
    }
  } catch (error) {
    console.error('Failed to restore navigation data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to restore navigation data', 
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}