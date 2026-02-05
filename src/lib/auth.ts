
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

// ⚠️ NODE.JS ONLY ⚠️
// This file initializes the DB adapter.
// Do NOT import this in Middleware.

// Log database connection status
console.log("🔐 Initializing NextAuth with Prisma adapter...");
console.log("📊 DATABASE_URL present:", !!process.env.DATABASE_URL);

let authExport;
try {
    authExport = NextAuth({
        adapter: PrismaAdapter(prisma),
        session: { strategy: "database" },
        ...authConfig,
    });
    console.log("✅ NextAuth initialized successfully");
} catch (error) {
    console.error("❌ Failed to initialize NextAuth:", error);
    // Fallback to JWT sessions if database adapter fails
    authExport = NextAuth({
        session: { strategy: "jwt" },
        ...authConfig,
    });
    console.log("⚠️ Falling back to JWT sessions");
}

export const { handlers, auth, signIn, signOut } = authExport;
