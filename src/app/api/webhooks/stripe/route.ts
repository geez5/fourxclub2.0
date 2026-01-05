import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, verifyWebhook } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

// Disable body parsing - Stripe needs raw body
export const runtime = 'edge'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!
  
  let event
  
  try {
    // Verify webhook signature
    event = verifyWebhook(body, signature)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }
  
  try {
    switch (event.type) {
      // Course purchase completed
      case 'checkout.session.completed': {
        const session = event.data.object
        
        if (session.metadata?.type === 'course') {
          await handleCoursePurchase(session)
        } else if (session.metadata?.type === 'discord') {
          await handleDiscordSubscription(session)
        }
        break
      }
      
      // Subscription updated (trial ended, renewed, etc.)
      case 'customer.subscription.updated': {
        await handleSubscriptionUpdate(event.data.object)
        break
      }
      
      // Subscription cancelled
      case 'customer.subscription.deleted': {
        await handleSubscriptionCancellation(event.data.object)
        break
      }
      
      // Payment failed
      case 'invoice.payment_failed': {
        await handlePaymentFailed(event.data.object)
        break
      }
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCoursePurchase(session: any) {
  const userId = session.metadata.userId
  const currency = session.metadata.currency
  
  // Get or create user
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()
  
  if (!user) {
    throw new Error('User not found')
  }
  
  // Record purchase
  await supabaseAdmin.from('course_purchases').insert({
    user_id: user.id,
    stripe_payment_id: session.id,
    amount: session.amount_total,
    currency: currency,
    status: 'completed'
  })
  
  // Log
  console.log(`Course purchased by user ${userId}`, {
    paymentId: session.id,
    amount: session.amount_total,
    currency
  })
  
  console.log(`Course purchased by user ${userId}`)
}

async function handleDiscordSubscription(session: any) {
  const userId = session.metadata.userId
  const currency = session.metadata.currency
  const trialDays = parseInt(session.metadata.trialDays || '30')
  const referralCode = session.metadata.referralCode
  
  // Get user
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, discord_id')
    .eq('clerk_id', userId)
    .single()
  
  if (!user) {
    throw new Error('User not found')
  }
  
  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  )
  
  const trialEnd = subscription.trial_end 
    ? new Date(subscription.trial_end * 1000) 
    : null
  
  // Record subscription
  const { data: newSub } = await supabaseAdmin
    .from('discord_subscriptions')
    .insert({
      user_id: user.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_end: trialEnd?.toISOString(),
    })
    .select()
    .single()
  
  // If referral code was used, record it
  if (referralCode && newSub) {
    const { data: refCode } = await supabaseAdmin
      .from('referral_codes')
      .select('id')
      .eq('code', referralCode)
      .single()
    
    if (refCode) {
      await supabaseAdmin.from('referral_uses').insert({
        referral_code_id: refCode.id,
        referred_user_id: user.id,
        subscription_id: newSub.id,
        extra_trial_days: 15
      })
      
      // Increment referral count
      await supabaseAdmin
        .from('referral_codes')
        .update({ uses_count: supabaseAdmin.raw('uses_count + 1') })
        .eq('id', refCode.id)
    }
  }
  
  // Add user to Discord (if they have linked their account)
  if (user.discord_id) {
    // We'll handle this in the Discord bot section
    // For now, just log it
    console.log(`User ${userId} should be added to Discord with role`)
  }
  
  console.log(`Discord subscribed by user ${userId}`, {
    subscriptionId: subscription.id,
    trialDays,
    referralCode: referralCode || null
  })
}

async function handleSubscriptionUpdate(subscription: any) {
  await supabaseAdmin
    .from('discord_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id)
  
  console.log(`Subscription ${subscription.id} updated to ${subscription.status}`)
}

async function handleSubscriptionCancellation(subscription: any) {
  // Update database
  await supabaseAdmin
    .from('discord_subscriptions')
    .update({
      status: 'canceled',
    })
    .eq('stripe_subscription_id', subscription.id)
  
  // Get user to remove from Discord
  const { data: sub } = await supabaseAdmin
    .from('discord_subscriptions')
    .select('user_id, users!inner(clerk_id, discord_id)')
    .eq('stripe_subscription_id', subscription.id)
    .single()
  
  if (sub && sub.users.discord_id) {
    // Remove from Discord (handled in Discord bot)
    console.log(`User should be removed from Discord: ${sub.users.discord_id}`)
  }
  
  console.log(`Discord unsubscribed`, {
    subscriptionId: subscription.id
  })
}

async function handlePaymentFailed(invoice: any) {
  console.log(`Payment failed for subscription: ${invoice.subscription}`)
  
  // Update subscription status
  await supabaseAdmin
    .from('discord_subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', invoice.subscription)
}