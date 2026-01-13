import { NextResponse, NextRequest } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const signature = req.headers.get('x-razorpay-signature') || ''

  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(payload)
  // handle event types (payment.captured, payment.failed, order.paid etc.)
  // e.g. update DB based on event.payload.payment.entity
  return NextResponse.json({ ok: true })
}