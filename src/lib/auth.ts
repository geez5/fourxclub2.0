import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/prisma";

export const authConfig = {
    adapter: PrismaAdapter(prisma),

    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    session: {
        strategy: "database",
    },

    secret: process.env.NEXTAUTH_SECRET,

    debug: true,
} satisfies NextAuthConfig;

// 🚨 DO NOT destructure directly
const authInstance = NextAuth(authConfig);

// ✅ THESE MUST EXIST
export const handlers = authInstance.handlers;
export const auth = authInstance.auth;
