
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { type } = await req.json();

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

        // Discord Subscription (Recurring)
        if (type === "discord_subscription") {
            // PLAN ID IS REQUIRED FOR SUBSCRIPTIONS
            // You must create a plan in Razorpay Dashboard and add it to .env
            const planId = process.env.RAZORPAY_PLAN_ID || "plan_OVjg4s7k0r2M6J";

            if (!planId) {
                console.error("RAZORPAY_PLAN_ID is missing in environment variables");
                return NextResponse.json({ error: "Server configuration error: Missing Plan ID" }, { status: 500 });
            }

            const subscription = await razorpay.subscriptions.create({
                plan_id: planId,
                customer_notify: 1,
                total_count: 120, // 10 years (indefinite roughly)
                notes: {
                    userId: session.user.id,
                    type: "discord_subscription",
                },
            });

            return NextResponse.json({
                success: true,
                subscriptionId: subscription.id,
                keyId: process.env.RAZORPAY_KEY_ID,
                method: "subscription",
                prefill: {
                    name: session.user.name,
                    email: session.user.email
                }
            });
        }

        return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });

    } catch (error: any) {
        console.error("Payment creation error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
