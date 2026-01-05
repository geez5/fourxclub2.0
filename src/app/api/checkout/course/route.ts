import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { stripe, PRICES } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { logAudit } from '@/lib/auditLog'

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { currency } = await req.json() // 'INR' or 'USD'
    
    // Check if user already purchased
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()
    
    if (user) {
      const { data: existing } = await supabaseAdmin
        .from('course_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .single()
      
      if (existing) {
        return NextResponse.json(
          { error: 'Course already purchased' },
          { status: 400 }
        )
      }
    }
    
    // Get price based on currency
    const price = currency === 'USD' 
      ? PRICES.COURSE.USD 
      : PRICES.COURSE.INR
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/course?canceled=true`,
      metadata: {
        userId,
        type: 'course',
        currency: price.currency
      },
      customer_email: user ? undefined : undefined, // Clerk handles email
    })
    
    // Log action
    await logAudit('course_checkout_initiated', userId, {
      sessionId: session.id,
      currency: price.currency,
      amount: price.amount
    }, req)
    
    return NextResponse.json({ url: session.url })
    
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}