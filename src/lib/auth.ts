import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

console.log("🚀 [AUTH] Loading auth.ts module...")
console.log("🔧 [AUTH] NODE_ENV:", process.env.NODE_ENV)

// Environment variable check with detailed logging
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

console.log("🔑 [AUTH] GOOGLE_CLIENT_ID present:", !!googleClientId)
console.log("🔑 [AUTH] GOOGLE_CLIENT_SECRET present:", !!googleClientSecret)
console.log("🔑 [AUTH] Auth secret source:",
    process.env.AUTH_SECRET ? "AUTH_SECRET" :
        process.env.NEXTAUTH_SECRET ? "NEXTAUTH_SECRET" :
            process.env.JWT_SECRET ? "JWT_SECRET" : "NONE"
)
console.log("🌐 [AUTH] NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "not set")

if (!googleClientId) console.error("❌ [AUTH] Missing GOOGLE_CLIENT_ID")
if (!googleClientSecret) console.error("❌ [AUTH] Missing GOOGLE_CLIENT_SECRET")
if (!authSecret) console.error("❌ [AUTH] Missing AUTH_SECRET/NEXTAUTH_SECRET/JWT_SECRET")

console.log("⚙️ [AUTH] Initializing NextAuth...")

let authExports
try {
    authExports = NextAuth({
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
            maxAge: 30 * 24 * 60 * 60,
        },
        callbacks: {
            async jwt({ token, user, account }) {
                console.log("🔄 [AUTH] JWT callback triggered")
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
                console.log("🔄 [AUTH] Session callback triggered")
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
    console.log("✅ [AUTH] NextAuth initialized successfully")
} catch (error) {
    console.error("❌ [AUTH] Failed to initialize NextAuth:", error)
    throw error
}

export const { handlers, auth, signIn, signOut } = authExports
console.log("✅ [AUTH] Auth exports ready")
