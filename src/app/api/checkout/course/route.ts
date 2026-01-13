import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { razorpay, PRICES } from '@/lib/razorpay'
import { supabaseAdmin } from '@/lib/supabase'
import { logAudit } from '@/lib/auditLogs'
import crypto from 'crypto'

// Create Razorpay order
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
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

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: price.amount,
      currency: price.currency,
      receipt: `course_${userId}_${Date.now()}`,
      notes: {
        userId,
        type: 'course',
        currency: price.currency
      }
    })
    
    // Store pending order in database
    if (user) {
      await supabaseAdmin
        .from('course_purchases')
        .insert({
          user_id: user.id,
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          status: 'pending',
          created_at: new Date().toISOString()
        })
    }
    
    // Log action
    await logAudit('course_checkout_initiated', userId, {
      orderId: order.id,
      currency: price.currency,
      amount: price.amount
    }, req)
    
    return NextResponse.json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    })
    
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout order' },
      { status: 500 }
    )
  }
}

// Verify payment and complete purchase
export async function PUT(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = await req.json()
    
    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const secret = process.env.RAZORPAY_KEY_SECRET!
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex')
    
    if (generated_signature !== razorpay_signature) {
      await logAudit('course_payment_verification_failed', userId, {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        reason: 'Invalid signature'
      }, req)
      
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }
    
    // Get user from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()
    
    if (!user) {
      // Create user if doesn't exist
      const { data: newUser } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: userId,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()
      
      if (!newUser) {
        throw new Error('Failed to create user')
      }
    }
    
    // Update purchase status
    const { error: updateError } = await supabaseAdmin
      .from('course_purchases')
      .update({
        payment_id: razorpay_payment_id,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('order_id', razorpay_order_id)
    
    if (updateError) {
      console.error('Failed to update purchase:', updateError)
      throw updateError
    }
    
    // Grant course access
    const { error: accessError } = await supabaseAdmin
      .from('users')
      .update({
        course_access: true,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', userId)
    
    if (accessError) {
      console.error('Failed to grant course access:', accessError)
      throw accessError
    }
    
    // Log successful payment
    await logAudit('course_payment_completed', userId, {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    }, req)
    
    return NextResponse.json({ 
      success: true,
      message: 'Payment verified and course access granted'
    })
    
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}

// Handle payment failure
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { orderId, reason, error: paymentError } = await req.json()
    
    // Get user from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()
    
    if (user) {
      // Update purchase status to failed
      await supabaseAdmin
        .from('course_purchases')
        .update({
          status: 'failed',
          failure_reason: reason || paymentError || 'Payment failed',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('user_id', user.id)
    }
    
    // Log failed payment
    await logAudit('course_payment_failed', userId, {
      orderId,
      reason: reason || paymentError || 'Payment failed'
    }, req)
    
    return NextResponse.json({ 
      success: true,
      message: 'Payment failure recorded'
    })
    
  } catch (error) {
    console.error('Payment failure logging error:', error)
    return NextResponse.json(
      { error: 'Failed to log payment failure' },
      { status: 500 }
    )
  }
}