
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

// ⚠️ EDGE RUNTIME COMPATIBLE CONF ⚠️
// Do not import Prisma here!

// Environment variable validation
const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
// NextAuth v5 uses AUTH_SECRET or NEXTAUTH_SECRET, fallback to JWT_SECRET for backwards compatibility
const nextAuthSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "";

// Log warnings for missing environment variables (only once at startup)
if (typeof window === "undefined") {
    if (!googleClientId) {
        console.error("❌ MISSING: GOOGLE_CLIENT_ID environment variable");
    }
    if (!googleClientSecret) {
        console.error("❌ MISSING: GOOGLE_CLIENT_SECRET environment variable");
    }
    if (!nextAuthSecret) {
        console.error("❌ MISSING: AUTH_SECRET/NEXTAUTH_SECRET/JWT_SECRET - one of these is required");
    } else {
        const secretSource = process.env.AUTH_SECRET ? "AUTH_SECRET" :
            process.env.NEXTAUTH_SECRET ? "NEXTAUTH_SECRET" : "JWT_SECRET";
        console.log(`✅ Using ${secretSource} for auth secret`);
    }
    if (!process.env.NEXTAUTH_URL && !process.env.AUTH_URL) {
        console.warn("⚠️ NEXTAUTH_URL not set - relying on request headers for URL detection");
    }
}

export const authConfig = {
    providers: [
        Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    secret: nextAuthSecret,
    trustHost: true, // Required for Railway/proxy deployments
    debug: process.env.NODE_ENV === "development",
    pages: {
        signIn: "/", // Redirect to home page for sign in
        error: "/", // Redirect errors to home page
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("👉 SIGNIN CALLBACK", { user, account, profile });
            return true;
        },
        async session({ session, token }) {
            console.log("👉 SESSION CALLBACK", { session, token });
            return session;
        },
        async jwt({ token, user, account }) {
            console.log("👉 JWT CALLBACK", { token, user, account });
            return token;
        },
        async authorized({ auth, request: { nextUrl } }) {
            console.log("👉 AUTHORIZED CALLBACK", { auth, nextUrl: nextUrl.pathname });
            return true;
        }
    }
} satisfies NextAuthConfig;
