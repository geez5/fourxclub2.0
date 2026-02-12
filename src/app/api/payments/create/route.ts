
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
        console.error("Payment creation error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
