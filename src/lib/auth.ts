import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

// Get secret from multiple possible env var names
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || ""

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    secret: authSecret,
    trustHost: true,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async signIn({ user, account }) {
            console.log("[AUTH] SignIn callback:", user.email)
            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.picture = user.image
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = (token.sub || token.id) as string
            }
            return session
        },
    },
    debug: true,
})
