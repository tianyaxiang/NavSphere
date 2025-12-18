import type { NextAuthConfig } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

export const authConfig: NextAuthConfig = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: { scope: 'repo' }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt'
  }
}

export default authConfig 