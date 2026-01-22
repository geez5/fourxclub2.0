import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user.id
    const user = session.user
    
    // Get or create user in database
    let { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (!dbUser) {
      // Create user
      const { data: newUser } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || ''
        })
        .select()
        .single()
      
      dbUser = newUser
    }
    
    // Check course purchase
    const { data: coursePurchase } = await supabaseAdmin
      .from('course_purchases')
      .select('*')
      .eq('user_id', dbUser.id)
      .eq('status', 'completed')
      .single()
    
    // Get video progress
    const { data: videoProgress } = await supabaseAdmin
      .from('video_progress')
      .select('*')
      .eq('user_id', dbUser.id)
      .order('video_number', { ascending: true })
    
    // Calculate course completion
    const completedVideos = videoProgress?.filter(v => v.completed).length || 0
    const courseCompletion = coursePurchase ? (completedVideos / 10) * 100 : 0
    
    // Check Discord subscription
    const { data: discordSub } = await supabaseAdmin
      .from('discord_subscriptions')
      .select('*')
      .eq('user_id', dbUser.id)
      .in('status', ['active', 'trialing'])
      .single()
    
    // Get referral info
    const { data: referralCode } = await supabaseAdmin
      .from('referral_codes')
      .select('code, uses_count')
      .eq('user_id', dbUser.id)
      .single()
    
    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.full_name,
        discordLinked: !!dbUser.discord_id
      },
      course: {
        purchased: !!coursePurchase,
        purchaseDate: coursePurchase?.purchased_at,
        completion: courseCompletion,
        videosCompleted: completedVideos,
        totalVideos: 10
      },
      discord: {
        subscribed: !!discordSub,
        status: discordSub?.status,
        trialEnd: discordSub?.trial_end,
        currentPeriodEnd: discordSub?.current_period_end,
        cancelAtPeriodEnd: discordSub?.cancel_at_period_end
      },
      referral: {
        code: referralCode?.code || null,
        uses: referralCode?.uses_count || 0,
        shareUrl: referralCode 
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/?ref=${referralCode.code}`
          : null
      },
      videoProgress: videoProgress || []
    })
    
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}