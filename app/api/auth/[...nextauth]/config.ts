import type { NextAuthConfig } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import type { DefaultSession, JWT } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      accessToken?: string
    } & DefaultSession['user']
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: { scope: 'repo' }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.accessToken = token.accessToken as string
      }
      return session
    }
  }
} 