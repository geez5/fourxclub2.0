
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

// ⚠️ NODE.JS ONLY ⚠️
// This file initializes the DB adapter.
// Do NOT import this in Middleware.

console.log("🔐 Initializing NextAuth...");
console.log("📊 DATABASE_URL present:", !!process.env.DATABASE_URL);
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);

// Use JWT sessions in production for reliability
// Database sessions can cause issues with cold starts and connection pooling
const useJwtSessions = process.env.USE_JWT_SESSIONS === "true" || process.env.NODE_ENV === "production";

const authOptions = useJwtSessions
    ? {
        // JWT sessions - more reliable for serverless/Railway
        session: { strategy: "jwt" as const },
        ...authConfig,
        callbacks: {
            ...authConfig.callbacks,
            // Store user ID in JWT token
            async jwt({ token, user, account }: any) {
                if (user) {
                    token.id = user.id;
                }
                if (account) {
                    token.accessToken = account.access_token;
                }
                console.log("👉 JWT CALLBACK", { tokenId: token.id });
                return token;
            },
            // Add user ID to session
            async session({ session, token }: any) {
                if (session.user && token.id) {
                    session.user.id = token.id as string;
                }
                console.log("👉 SESSION CALLBACK", { userId: session.user?.id });
                return session;
            },
        },
    }
    : {
        // Database sessions - for development
        adapter: PrismaAdapter(prisma),
        session: { strategy: "database" as const },
        ...authConfig,
    };

console.log("📋 Session strategy:", useJwtSessions ? "JWT" : "database");

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
console.log("✅ NextAuth initialized");
