import { NextResponse } from "next/server"

export async function GET() {
    const config = {
        googleClientId: !!process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        authSecret: !!process.env.AUTH_SECRET,
        nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        jwtSecret: !!process.env.JWT_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL || process.env.AUTH_URL || "not set",
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: !!process.env.DATABASE_URL,
    }

    const missing = []
    if (!process.env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID")
    if (!process.env.GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET")
    if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET && !process.env.JWT_SECRET) {
        missing.push("AUTH_SECRET or NEXTAUTH_SECRET or JWT_SECRET")
    }

    return NextResponse.json({
        status: missing.length === 0 ? "OK" : "MISSING_ENV_VARS",
        missing,
        config,
        timestamp: new Date().toISOString(),
    })
}

export const dynamic = "force-dynamic"
