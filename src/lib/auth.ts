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
    pages: {
        error: '/auth/error', // Redirect to custom error page
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("[AUTH] SignIn callback started for:", user.email);
            
            if (!user.email) {
                console.error("[AUTH] No email provided by OAuth provider");
                return false;
            }

            try {
                // Check if user exists safely
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email },
                });

                if (!existingUser) {
                    console.log("[AUTH] New user detected, will send welcome email to:", user.email);
                    const email = user.email;
                    const name = user.name || "Trader";

                    // Import and send email asynchronously
                    import("./email").then(({ sendWelcomeEmail }) => {
                        sendWelcomeEmail(email, name).catch(err => {
                            console.error("[AUTH] Failed to send welcome email:", err);
                        });
                    }).catch(err => {
                        console.error("[AUTH] Failed to import email module:", err);
                    });
                }
                
                console.log("[AUTH] SignIn callback successful");
                return true;
            } catch (err) {
                // Log the exact error for debugging
                console.error("[AUTH] Database error during signIn callback:", err);
                
                // Return true anyway if it's a known adapter issue so they still get a JWT session
                // The adapter might throw on account linking but we can still sign them in
                if (err instanceof Error && err.message.includes('Unique constraint')) {
                     console.log("[AUTH] Recovered from unique constraint error");
                     return true;
                }
                
                // Let other errors fail gracefully to the error page
                return false;
            }
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            } else if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    debug: process.env.NODE_ENV === "development",
})
