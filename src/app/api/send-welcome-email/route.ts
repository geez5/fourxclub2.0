import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email, name } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const result = await sendWelcomeEmail(email, name || "Trader");

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: "Failed to send email", details: result.error },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("[API/send-welcome-email] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
