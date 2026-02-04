
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    let dbStatus = 'testing';
    try {
        await prisma.user.findFirst();
        dbStatus = 'connected';
    } catch (e: any) {
        dbStatus = 'failed: ' + e.message;
    }

    const googleId = process.env.GOOGLE_CLIENT_ID || '';
    const googleSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    return NextResponse.json({
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,

        // Check for accidental quotes (Common Vercel Mistake)
        GOOGLE_ID_HAS_QUOTES: googleId.startsWith('"') || googleId.endsWith('"') || googleId.startsWith("'") || googleId.endsWith("'"),
        GOOGLE_SECRET_HAS_QUOTES: googleSecret.startsWith('"') || googleSecret.endsWith('"') || googleSecret.startsWith("'") || googleSecret.endsWith("'"),

        // Check DB
        DB_STATUS: dbStatus,

        // Debug content safely (first/last chars)
        GOOGLE_ID_PREVIEW: `${googleId.substring(0, 3)}...${googleId.slice(-3)}`,

        NODE_ENV: process.env.NODE_ENV,
    });
}
