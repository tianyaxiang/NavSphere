export interface SessionData {
  user?: {
    accessToken?: string
    email?: string
    name?: string
    image?: string
  }
  isLoggedIn: boolean
} 