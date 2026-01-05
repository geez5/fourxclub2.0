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
    
    const { currency, referralCode } = await req.json()
    
    // Get user from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('clerk_id', userId)
      .single()
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if already subscribed
    const { data: existing } = await supabaseAdmin
      .from('discord_subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .single()
    
    if (existing) {
      return NextResponse.json(
        { error: 'Already subscribed' },
        { status: 400 }
      )
    }
    
    // Calculate trial period (30 days default, 45 if referral used)
    let trialDays = 30
    
    if (referralCode) {
      // Validate and apply referral
      const { data: refCode } = await supabaseAdmin
        .from('referral_codes')
        .select('id, user_id')
        .eq('code', referralCode)
        .single()
      
      if (refCode && refCode.user_id !== user.id) {
        // Check if not already used
        const { data: alreadyUsed } = await supabaseAdmin
          .from('referral_uses')
          .select('id')
          .eq('referred_user_id', user.id)
          .single()
        
        if (!alreadyUsed) {
          trialDays = 45 // 30 + 15 bonus days
        }
      }
    }
    
    // Get price based on currency
    const price = currency === 'USD' 
      ? PRICES.DISCORD.USD 
      : PRICES.DISCORD.INR
    
    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?discord_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/discord?canceled=true`,
      subscription_data: {
        trial_period_days: trialDays,
        metadata: {
          referralCode: referralCode || ''
        }
      },
      metadata: {
        userId,
        type: 'discord',
        currency: price.currency,
        trialDays: trialDays.toString(),
        referralCode: referralCode || ''
      },
      customer_email: user.email,
    })
    
    // Log action
    await logAudit('discord_checkout_initiated', userId, {
      sessionId: session.id,
      currency: price.currency,
      trialDays,
      referralCode: referralCode || null
    }, req)
    
    return NextResponse.json({ url: session.url })
    
  } catch (error) {
    console.error('Discord checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}