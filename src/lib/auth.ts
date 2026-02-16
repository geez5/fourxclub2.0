import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

// Get secret from multiple possible env var names
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

// Validate required env vars at startup
if (!authSecret) {
    console.error("❌ [AUTH] CRITICAL: No auth secret found! Set AUTH_SECRET or NEXTAUTH_SECRET in your .env.local file.")
    console.error("   Generate one with: openssl rand -base64 32")
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("⚠️ [AUTH] Google OAuth credentials missing. Google login will not work.")
    console.warn("   Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env.local file.")
    console.warn("   Get them from: https://console.cloud.google.com/apis/credentials")
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
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

            // Check if user is signing in for the first time
            if (user.email) {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email },
                    })

                    if (!existingUser) {
                        // New user — send welcome email after a short delay
                        // to allow PrismaAdapter to create the user record first
                        console.log("[AUTH] New user detected, will send welcome email to:", user.email)
                        const email = user.email
                        const name = user.name || "Trader"

                        // Import and send email asynchronously (don't block sign-in)
                        import("./email").then(({ sendWelcomeEmail }) => {
                            sendWelcomeEmail(email, name).catch(err => {
                                console.error("[AUTH] Failed to send welcome email:", err)
                            })
                        }).catch(err => {
                            console.error("[AUTH] Failed to import email module:", err)
                        })
                    }
                } catch (err) {
                    // Don't block sign-in if email check fails
                    console.error("[AUTH] Error checking for existing user:", err)
                }
            }

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
    debug: process.env.NODE_ENV === "development",
})
