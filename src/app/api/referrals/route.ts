import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateReferralCode, applyReferralCode, getReferralStats } from '@/lib/referrals'
import { logAudit } from '@/lib/auditLog'

// GET - Get user's referral code and stats
export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get or generate referral code
    let { data: referralCode } = await supabaseAdmin
      .from('referral_codes')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (!referralCode) {
      const code = await generateReferralCode(user.id)
      referralCode = { code, uses_count: 0 }
    }
    
    // Get stats
    const stats = await getReferralStats(user.id)
    
    return NextResponse.json({
      code: referralCode.code,
      totalUses: stats.totalUses,
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/?ref=${referralCode.code}`
    })
    
  } catch (error) {
    console.error('Get referral error:', error)
    return NextResponse.json(
      { error: 'Failed to get referral code' },
      { status: 500 }
    )
  }
}

// POST - Validate and apply referral code
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { code } = await req.json()
    
    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      )
    }
    
    // Get user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Apply referral code
    const result = await applyReferralCode(code, user.id)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    // Log
    await logAudit('referral_code_applied', userId, {
      code,
      extraDays: result.extraDays
    }, req)
    
    return NextResponse.json({
      success: true,
      extraDays: result.extraDays,
      message: `You've received ${result.extraDays} extra trial days!`
    })
    
  } catch (error) {
    console.error('Apply referral error:', error)
    return NextResponse.json(
      { error: 'Failed to apply referral code' },
      { status: 500 }
    )
  }
}