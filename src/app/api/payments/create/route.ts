
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
    try {
        // Rate limit: strict (10 req / 15 min)
        const limited = await applyRateLimit(req, "strict");
        if (limited) return limited;

        // Diagnostic: Check if Razorpay env vars are present
        console.log("[PAYMENTS/CREATE] RAZORPAY_KEY_ID present:", !!process.env.RAZORPAY_KEY_ID);
        console.log("[PAYMENTS/CREATE] RAZORPAY_KEY_SECRET present:", !!process.env.RAZORPAY_KEY_SECRET);

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("[PAYMENTS/CREATE] ❌ Missing Razorpay credentials!");
            return NextResponse.json(
                { error: "Payment service not configured. Please contact support." },
                { status: 503 }
            );
        }

        const session = await auth();
        console.log("[PAYMENTS/CREATE] Session user:", session?.user?.id ? "authenticated" : "NOT authenticated");
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { type } = await req.json();
        console.log("[PAYMENTS/CREATE] Payment type requested:", type);

        if (!type) {
            return NextResponse.json({ error: "Payment type is required" }, { status: 400 });
        }

        // Course Payment (One-time)
        if (type === "course") {
            const amount = 1499 * 100; // INR 1499 in paise
            const options = {
                amount: amount.toString(),
                currency: "INR",
                receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                payment_capture: 1,
                notes: {
                    userId: session.user.id,
                    type: "course",
                },
            };

            const order = await razorpay.orders.create(options);

            return NextResponse.json({
                success: true,
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                method: "order",
                prefill: {
                    name: session.user.name,
                    email: session.user.email
                }
            });
        }

        // Discord Community Access (One-time ₹2000)
        if (type === "discord_subscription") {
            const amount = 2000 * 100; // INR 2000 in paise
            const options = {
                amount: amount.toString(),
                currency: "INR",
                receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                payment_capture: 1,
                notes: {
                    userId: session.user.id,
                    type: "discord_subscription",
                },
            };

            const order = await razorpay.orders.create(options);

            return NextResponse.json({
                success: true,
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                method: "order",
                prefill: {
                    name: session.user.name,
                    email: session.user.email
                }
            });
        }

        // Combo Package (Course + Discord, One-time)
        if (type === "combo") {
            const amount = 2499 * 100; // INR 2499 in paise
            const options = {
                amount: amount.toString(),
                currency: "INR",
                receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                payment_capture: 1,
                notes: {
                    userId: session.user.id,
                    type: "combo",
                },
            };

            const order = await razorpay.orders.create(options);

            return NextResponse.json({
                success: true,
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                method: "order",
                prefill: {
                    name: session.user.name,
                    email: session.user.email
                }
            });
        }

        return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });

    } catch (error: any) {
        console.error("[PAYMENTS/CREATE] ❌ Payment creation error:", {
            name: error?.name,
            message: error?.message,
            statusCode: error?.statusCode,
            error: error?.error,
            stack: error?.stack?.split('\n').slice(0, 3).join('\n'),
        });
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
