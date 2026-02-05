import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

// Environment variable check
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

if (!googleClientId) console.error("❌ Missing GOOGLE_CLIENT_ID")
if (!googleClientSecret) console.error("❌ Missing GOOGLE_CLIENT_SECRET")
if (!authSecret) console.error("❌ Missing AUTH_SECRET/NEXTAUTH_SECRET/JWT_SECRET")

export const { handlers, auth, signIn, signOut } = NextAuth({
    // No adapter - using JWT sessions only (no database at startup)
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
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user, account, profile }) {
            // First sign in - save user data to token
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.picture = user.image
            }
            if (account) {
                token.accessToken = account.access_token
            }
            return token
        },
        async session({ session, token }) {
            // Add user id to session
            if (session.user) {
                session.user.id = token.sub || token.id as string
                session.user.email = token.email as string
                session.user.name = token.name as string
                session.user.image = token.picture as string
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
