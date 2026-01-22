import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import { addUserToDiscord } from '@/lib/discord-bots'
import { logAudit } from '@/lib/auditLog'

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user.id
    
    const { discordId } = await req.json()
    
    if (!discordId) {
      return NextResponse.json(
        { error: 'Discord ID required' },
        { status: 400 }
      )
    }
    
    // Get user from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single()
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if Discord ID already linked to another user
    const { data: existingLink } = await supabaseAdmin
      .from('discord_links')
      .select('id')
      .eq('discord_id', discordId)
      .neq('user_id', user.id)
      .single()
    
    if (existingLink) {
      return NextResponse.json(
        { error: 'Discord account already linked to another user' },
        { status: 400 }
      )
    }
    
    // Check if user has active Discord subscription
    const { data: subscription } = await supabaseAdmin
      .from('discord_subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .single()
    
    // If subscribed, add role immediately
    if (subscription) {
      // FIX: Pass both discordId and userId as required by the function
      const added = await addUserToDiscord(discordId, userId)
      
      if (!added) {
        return NextResponse.json(
          { error: 'Failed to add user to Discord server' },
          { status: 500 }
        )
      }
    }
    
    // Store Discord link
    const { error: linkError } = await supabaseAdmin
      .from('discord_links')
      .upsert({
        user_id: user.id,
        discord_id: discordId,
        linked_at: new Date().toISOString()
      })
    
    if (linkError) {
      console.error('Failed to store Discord link:', linkError)
      return NextResponse.json(
        { error: 'Failed to link Discord account' },
        { status: 500 }
      )
    }
    
    // Log action
    await logAudit('discord_linked', userId, {
      discordId,
      hasSubscription: !!subscription
    }, req)
    
    return NextResponse.json({
      success: true,
      message: subscription 
        ? 'Discord linked and role added successfully'
        : 'Discord linked successfully. Subscribe to get server access.'
    })
    
  } catch (error) {
    console.error('Discord link error:', error)
    return NextResponse.json(
      { error: 'Failed to link Discord account' },
      { status: 500 }
    )
  }
}