
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

// ⚠️ NODE.JS ONLY ⚠️
// This file initializes the DB adapter.
// Do NOT import this in Middleware.

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "database" },
    ...authConfig,
});
