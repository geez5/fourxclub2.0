import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id
            }
            return session
        },
        async redirect({ url, baseUrl }) {
            // Redirect to dashboard after sign in
            if (url.startsWith(baseUrl)) return url
            if (url.startsWith('/')) return `${baseUrl}${url}`
            return `${baseUrl}/dashboard`
        },
    },
    session: {
        strategy: "database",
    },
    trustHost: true,
})
