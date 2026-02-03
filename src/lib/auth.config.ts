import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    providers: [], // Providers are configured in auth.ts for Node.js environment
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    callbacks: {
        async session({ session, token }) {
            console.log("Auth Session Callback - Token:", token?.sub);
            if (session.user && token.sub) {
                session.user.id = token.sub
            }
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            console.log(`Auth Middleware - Authorized Check: Path=${nextUrl.pathname}, LoggedIn=${isLoggedIn}`);

            // This is called in middleware
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
            const isOnCourse = nextUrl.pathname.startsWith('/course')
            const isOnAdmin = nextUrl.pathname.startsWith('/admin')

            if (isOnDashboard || isOnCourse || isOnAdmin) {
                if (isLoggedIn) return true
                console.log("Auth Middleware - Redirecting unauthenticated user");
                return false // Redirect unauthenticated users to login page
            }
            return true
        },
    },
    session: {
        strategy: "jwt",
    },
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig
