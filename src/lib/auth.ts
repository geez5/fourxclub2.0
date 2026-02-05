import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

console.log("🚀 [AUTH] Loading auth module...")

// Environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

console.log("🔑 [AUTH] Env check - GOOGLE_CLIENT_ID:", !!googleClientId)
console.log("🔑 [AUTH] Env check - GOOGLE_CLIENT_SECRET:", !!googleClientSecret)
console.log("🔑 [AUTH] Env check - Secret source:",
    process.env.AUTH_SECRET ? "AUTH_SECRET" :
        process.env.NEXTAUTH_SECRET ? "NEXTAUTH_SECRET" :
            process.env.JWT_SECRET ? "JWT_SECRET" : "NONE"
)

if (!authSecret) {
    console.error("❌ [AUTH] CRITICAL: No auth secret found!")
}

console.log("⚙️ [AUTH] Creating NextAuth config...")

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: googleClientId || "",
            clientSecret: googleClientSecret || "",
        }),
    ],
    secret: authSecret,
    trustHost: true,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("🔐 [AUTH] SignIn callback triggered")
            console.log("🔐 [AUTH] User email:", user.email)
            console.log("🔐 [AUTH] Provider:", account?.provider)
            // Allow all sign-ins
            return true
        },
        async jwt({ token, user, account, profile }) {
            console.log("🎫 [AUTH] JWT callback triggered")
            if (user) {
                console.log("🎫 [AUTH] New user sign-in, setting token data")
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.picture = user.image
            }
            if (account) {
                token.accessToken = account.access_token
                token.provider = account.provider
            }
            return token
        },
        async session({ session, token }) {
            console.log("📋 [AUTH] Session callback triggered")
            if (session.user) {
                session.user.id = (token.sub || token.id) as string
            }
            return session
        },
        async redirect({ url, baseUrl }) {
            console.log("🔀 [AUTH] Redirect callback - url:", url, "baseUrl:", baseUrl)
            // Always redirect to dashboard after sign-in
            if (url.includes("/api/auth")) {
                return `${baseUrl}/dashboard`
            }
            return url.startsWith(baseUrl) ? url : baseUrl
        },
    },
    pages: {
        error: "/api/auth/error",
    },
    debug: true, // Enable debug mode for more logs
})

console.log("✅ [AUTH] NextAuth configured successfully")
