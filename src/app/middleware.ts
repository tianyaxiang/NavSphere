import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 检查是否访问后台路径
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // TODO: 添加身份验证逻辑
    // 例如检查 session、token 等
    
    // 如果未登录，重定向到登录页
    // return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
} 