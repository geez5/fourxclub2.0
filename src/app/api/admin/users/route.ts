import { NextResponse } from 'next/server'
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { razorpay } from '@/lib/razorpay'

const ADMIN_EMAIL = 'hello@fourxclub.in'

// GET - Search and list users
export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user || user.emailAddresses[0].emailAddress !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit
    
    // Build query
    let query = supabaseAdmin
      .from('users')
      .select(`
        *,
        course_purchases (id, purchased_at, amount, currency),
        discord_subscriptions (id, status, current_period_end),
        referral_codes (code, uses_count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Add search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    const users = data.map(u => ({
      id: u.id,
      clerkId: u.clerk_id,
      email: u.email,
      fullName: u.full_name,
      discordId: u.discord_id,
      createdAt: u.created_at,
      coursePurchased: u.course_purchases && u.course_purchases.length > 0,
      coursePurchaseDate: u.course_purchases?.[0]?.purchased_at,
      courseAmount: u.course_purchases?.[0]?.amount,
      courseCurrency: u.course_purchases?.[0]?.currency,
      discordSubscribed: u.discord_subscriptions && u.discord_subscriptions.length > 0,
      discordStatus: u.discord_subscriptions?.[0]?.status,
      discordEndDate: u.discord_subscriptions?.[0]?.current_period_end,
      referralCode: u.referral_codes?.[0]?.code,
      referralUses: u.referral_codes?.[0]?.uses_count || 0
    }))
    
    return NextResponse.json({
      users,
      total: count,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    })
    
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST - Perform admin actions on users
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user || user.emailAddresses[0].emailAddress !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const { action, targetUserId, data } = await req.json()
    
    switch (action) {
      case 'grant_course_access':
        return await grantCourseAccess(targetUserId)
      
      case 'revoke_course_access':
        return await revokeCourseAccess(targetUserId)
      
      case 'cancel_discord_subscription':
        return await cancelDiscordSubscription(targetUserId)
      
      case 'refund_payment':
        return await refundPayment(targetUserId, data.paymentId)
      
      case 'ban_user':
        return await banUser(targetUserId)
      
      case 'unban_user':
        return await unbanUser(targetUserId)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Admin action error:', error)
    return NextResponse.json(
      { error: 'Action failed' },
      { status: 500 }
    )
  }
}

async function grantCourseAccess(userId: string) {
  // Get user
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  
  // Check if already has access
  const { data: existing } = await supabaseAdmin
    .from('course_purchases')
    .select('id')
    .eq('user_id', user.id)
    .single()
  
  if (existing) {
    return NextResponse.json({ error: 'User already has access' }, { status: 400 })
  }
  
  // Grant access (changed payment_id field for Razorpay)
  await supabaseAdmin.from('course_purchases').insert({
    user_id: user.id,
    razorpay_payment_id: `admin_grant_${Date.now()}`,
    amount: 0,
    currency: 'INR',
    status: 'completed'
  })
  
  return NextResponse.json({ 
    success: true, 
    message: 'Course access granted' 
  })
}

async function revokeCourseAccess(userId: string) {
  await supabaseAdmin
    .from('course_purchases')
    .delete()
    .eq('user_id', userId)
  
  return NextResponse.json({ 
    success: true, 
    message: 'Course access revoked' 
  })
}

async function cancelDiscordSubscription(userId: string) {
  // Get subscription
  const { data: sub } = await supabaseAdmin
    .from('discord_subscriptions')
    .select('razorpay_subscription_id')
    .eq('user_id', userId)
    .single()
  
  if (!sub || !sub.razorpay_subscription_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
  }
  
  // Cancel in Razorpay
  await razorpay.subscriptions.cancel(sub.razorpay_subscription_id)
  
  // Update database
  await supabaseAdmin
    .from('discord_subscriptions')
    .update({ status: 'cancelled' })
    .eq('user_id', userId)
  
  return NextResponse.json({ 
    success: true, 
    message: 'Subscription cancelled' 
  })
}

async function refundPayment(userId: string, paymentId: string) {
  // Get payment
  const { data: purchase } = await supabaseAdmin
    .from('course_purchases')
    .select('razorpay_payment_id, razorpay_order_id, amount')
    .eq('user_id', userId)
    .eq('razorpay_payment_id', paymentId)
    .single()
  
  if (!purchase) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }
  
  // Get payment details from Razorpay
  const payment = await razorpay.payments.fetch(purchase.razorpay_payment_id)
  
  // Create refund (amount in paise)
  await razorpay.payments.refund(purchase.razorpay_payment_id, {
    amount: payment.amount, // Full refund
    speed: 'normal',
    notes: {
      reason: 'Admin refund',
      refunded_by: 'admin'
    }
  })
  
  // Update database
  await supabaseAdmin
    .from('course_purchases')
    .update({ status: 'refunded' })
    .eq('razorpay_payment_id', paymentId)
  
  return NextResponse.json({ 
    success: true, 
    message: 'Payment refunded' 
  })
}

async function banUser(userId: string) {
  // Get user's Clerk ID
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('clerk_id')
    .eq('id', userId)
    .single()
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  
  // Ban in Clerk
  const clerk = await clerkClient()
  await clerk.users.banUser(user.clerk_id)
  
  // Revoke all access
  await supabaseAdmin
    .from('course_purchases')
    .delete()
    .eq('user_id', userId)
  
  // Cancel Discord subscription if exists
  const { data: sub } = await supabaseAdmin
    .from('discord_subscriptions')
    .select('razorpay_subscription_id')
    .eq('user_id', userId)
    .single()
  
  if (sub && sub.razorpay_subscription_id) {
    try {
      await razorpay.subscriptions.cancel(sub.razorpay_subscription_id)
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
    }
  }
  
  return NextResponse.json({ 
    success: true, 
    message: 'User banned' 
  })
}

async function unbanUser(userId: string) {
  // Get user's Clerk ID
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('clerk_id')
    .eq('id', userId)
    .single()
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  
  // Unban in Clerk
  const clerk = await clerkClient()
  await clerk.users.unbanUser(user.clerk_id)
  
  return NextResponse.json({ 
    success: true, 
    message: 'User unbanned' 
  })
}