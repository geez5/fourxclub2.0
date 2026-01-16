// src/app/api/webhooks/PayU/route.ts
// TEMPORARY: Payment processing disabled for demo

import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // Payment webhook disabled - return success for now
  // TODO: Implement Stripe/Instamojo webhook here
  
  return NextResponse.json({ 
    message: "Payment processing temporarily disabled",
    status: "pending" 
  }, { status: 200 });
}

/*
// ORIGINAL CODE - Commented out for later use with Stripe/Instamojo
import { NextResponse, NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/PayU";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('x-PayU-signature') || '';

  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(payload);
  // handle event types (payment.captured, payment.failed, order.paid etc.)
  // e.g. update DB based on event.payload.payment.entity
  return NextResponse.json({ ok: true });
}
*/