import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
    providers: [],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnAdmin = nextUrl.pathname.startsWith('/admin')

            if (isOnAdmin) {
                if (isLoggedIn) return true
                return false // Redirect unauthenticated users to login page
            }

            return true
        },
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
    },
    pages: {
        signIn: '/auth/signin'
    }
} satisfies NextAuthConfig
