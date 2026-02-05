import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// Environment variable check
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

if (!googleClientId) console.error("❌ Missing GOOGLE_CLIENT_ID")
if (!googleClientSecret) console.error("❌ Missing GOOGLE_CLIENT_SECRET")
if (!authSecret) console.error("❌ Missing AUTH_SECRET/NEXTAUTH_SECRET/JWT_SECRET")

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    secret: authSecret,
    trustHost: true,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // First sign in - save user data to token
            if (user) {
                token.id = user.id
            }
            if (account) {
                token.accessToken = account.access_token
            }
            return token
        },
        async session({ session, token }) {
            // Add user id to session
            if (session.user && token.id) {
                session.user.id = token.id as string
            }
            return session
        },
    },
    pages: {
        signIn: "/",
        error: "/",
    },
    debug: process.env.NODE_ENV === "development",
})
