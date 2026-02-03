import { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      phoneNumber?: string | null
      role?: string
      backendToken?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    phoneNumber?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    phoneNumber?: string | null
  }
}