// src/app/api/checkout/course/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Disable all payment processing temporarily
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'Payment processing temporarily disabled. Please use access code.' },
    { status: 503 }
  )
}

export async function PUT(_req: NextRequest) {
  return NextResponse.json(
    { error: 'Payment verification temporarily disabled.' },
    { status: 503 }
  )
}

export async function PATCH(_req: NextRequest) {
  return NextResponse.json({ ok: true }, { status: 200 })
}

/*
// ORIGINAL PayU CODE - Keep for reference when implementing Stripe/Instamojo

import { NextRequest, NextResponse } from 'next/server'
import { PayU, toSmallestUnit } from '@/lib/PayU'
import crypto from 'crypto'

const COURSE_PRICES = {
  INR: 999,
  USD: 12
}

export async function POST(req: NextRequest) {
  try {
    const { currency } = await req.json()
    const amount = COURSE_PRICES[currency as keyof typeof COURSE_PRICES] || COURSE_PRICES.INR
    
    const order = await PayU.orders.create({
      amount: toSmallestUnit(amount, currency),
      currency,
      receipt: `receipt_${Date.now()}`,
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_PayU_KEY_ID,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { PayU_order_id, PayU_payment_id, PayU_signature } = await req.json()
    
    const sign = `${PayU_order_id}|${PayU_payment_id}`
    const expectedSign = crypto
      .createHmac('sha256', process.env.PayU_KEY_SECRET!)
      .update(sign)
      .digest('hex')

    if (PayU_signature === expectedSign) {
      // Update database with successful payment
      return NextResponse.json({ verified: true })
    }
    
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
*/