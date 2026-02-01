import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { amount, currency: _currency, receipt: _receipt } = await req.json()

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Temporarily disabled - redirect to access code flow
    return NextResponse.json(
      { error: 'Payment processing temporarily disabled. Please use access code.' },
      { status: 503 }
    )

    // const order = await createOrder(amount, currency || process.env.PAYMENT_CURRENCY || 'INR', receipt)

    // return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}