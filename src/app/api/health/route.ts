import { NextResponse } from 'next/server';

export async function GET() {
    console.log("🏥 [HEALTH] Health check requested");
    console.log("🔧 [HEALTH] NODE_ENV:", process.env.NODE_ENV);
    console.log("🔧 [HEALTH] DATABASE_URL present:", !!process.env.DATABASE_URL);
    console.log("🔧 [HEALTH] GOOGLE_CLIENT_ID present:", !!process.env.GOOGLE_CLIENT_ID);

    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    }, { status: 200 });
}

export const dynamic = "force-dynamic";
