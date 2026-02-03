
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { code } = await req.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json({ error: "Invalid code" }, { status: 400 });
        }

        const cleanCode = code.toUpperCase().trim();

        // 1. Check if user already has a referrer
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { referredByCode: true, referralCode: true }
        });

        if (user?.referredByCode) {
            return NextResponse.json({ error: "You have already applied a referral code" }, { status: 400 });
        }

        // 2. Prevent self-referral
        if (user?.referralCode === cleanCode) {
            return NextResponse.json({ error: "You cannot use your own referral code" }, { status: 400 });
        }

        // 3. Verify code exists
        const referrer = await prisma.user.findUnique({
            where: { referralCode: cleanCode }
        });

        if (!referrer) {
            return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
        }

        // 4. Apply Code
        await prisma.user.update({
            where: { id: session.user.id },
            data: { referredByCode: cleanCode }
        });

        return NextResponse.json({ success: true, message: "Referral code applied successfully" });

    } catch (error: any) {
        console.error("Referral apply error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
