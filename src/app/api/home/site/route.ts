import { NextResponse } from 'next/server'
import siteData from '@/navsphere/content/site.json'

export const runtime = 'edge'

export async function GET() {
  try {
    return NextResponse.json(siteData)
  } catch (error) {
    console.error('Error in site API:', error)
    return NextResponse.json(
      { error: '获取站点数据失败' },
      { status: 500 }
    )
  }
}
