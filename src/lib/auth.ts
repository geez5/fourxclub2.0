import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"



import jwt from "jsonwebtoken"

// Check for missing environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
    console.error("CRITICAL ERROR: GOOGLE_CLIENT_ID is missing from environment variables!");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.error("CRITICAL ERROR: GOOGLE_CLIENT_SECRET is missing from environment variables!");
}
if (!process.env.NEXTAUTH_SECRET) {
    console.error("CRITICAL ERROR: NEXTAUTH_SECRET is missing from environment variables!");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    ...authConfig,
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account, profile }) {
            console.log("Auth SignIn Callback - Provider:", account?.provider);
            if (account?.provider === "google") {
                // You can add more checks here if needed
                console.log("Google Sign In Attempt:", user.email);
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub

                // Generate backend compatible token
                try {
                    const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET
                    if (secret) {
                        session.user.backendToken = jwt.sign(
                            {
                                userId: session.user.id,
                                email: session.user.email
                            },
                            secret,
                            { expiresIn: '1d' }
                        )
                    } else {
                        console.error("Auth Session - Missing JWT_SECRET or AUTH_SECRET");
                    }
                } catch (error) {
                    console.error("Error generating backend token:", error)
                }
            }
            return session
        },
    }
})