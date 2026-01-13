import { NextResponse, NextRequest } from 'next/server'
import { createOrder } from '@/lib/razorpay'
import { getAuth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount, currency, receipt } = await req.json()
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const order = await createOrder(amount, currency || process.env.PAYMENT_CURRENCY || 'INR', receipt)
  return NextResponse.json({ order, keyId: process.env.RAZORPAY_KEY_ID })
}

// Example client request
fetch('/api/payments/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 29.99, currency: 'USD', receipt: 'rcpt_123' })
})