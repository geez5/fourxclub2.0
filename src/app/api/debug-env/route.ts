import { NextResponse } from 'next/server';

export async function GET() {
    const googleId = process.env.GOOGLE_CLIENT_ID || '';
    const googleSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    return NextResponse.json({
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        DATABASE_URL_SET: !!process.env.DATABASE_URL,

        // Check for accidental quotes
        GOOGLE_ID_HAS_QUOTES: googleId.startsWith('"') || googleId.endsWith('"'),
        GOOGLE_SECRET_HAS_QUOTES: googleSecret.startsWith('"') || googleSecret.endsWith('"'),

        // Preview (first/last chars)
        GOOGLE_ID_PREVIEW: `${googleId.substring(0, 3)}...${googleId.slice(-3)}`,

        NODE_ENV: process.env.NODE_ENV,
    });
}

export const dynamic = "force-dynamic";
