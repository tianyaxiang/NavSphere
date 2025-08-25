import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import type { SessionData } from '@/types/session'

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not defined')
}

const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: 'navsphere-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
  
  // 初始化会话数据
  if (!session.isLoggedIn) {
    session.isLoggedIn = false
  }
  
  return session
} 