
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

// ⚠️ EDGE RUNTIME COMPATIBLE CONF ⚠️
// Do not import Prisma here!

export const authConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    debug: true, // process.env.NODE_ENV === "development",
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
