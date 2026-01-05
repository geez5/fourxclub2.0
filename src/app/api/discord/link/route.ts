import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { supabaseAdmin } from '@/lib/supabase'
import { addUserToDiscord } from '@/lib/discord-bot'
import { logAudit } from '@/lib/auditLog'

// Link Discord account
export async function POST(req: Request) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { discordId } = await req.json()
    
    if (!discordId) {
      return NextResponse.json(
        { error: 'Discord ID is required' },
        { status: 400 }
      )
    }
    
    // Get user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, discord_id')
      .eq('clerk_id', userId)
      .single()
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Update Discord ID
    await supabaseAdmin
      .from('users')
      .update({ discord_id: discordId })
      .eq('id', user.id)
    
    // Check if user has active subscription
    const { data: subscription } = await supabaseAdmin
      .from('discord_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .single()
    
    // If subscribed, add role immediately
    if (subscription) {
      const added = await addUserToDiscord(discordId)
      
      if (!added) {
        return NextResponse.json(
          { error: 'Failed to add role. Make sure you\'ve joined the Discord server.' },
          { status: 400 }
        )
      }
    }
    
    // Log
    await logAudit('discord_linked', userId, { discordId }, req)
    
    return NextResponse.json({
      success: true,
      message: subscription 
        ? 'Discord linked and premium role added!' 
        : 'Discord linked successfully!'
    })
    
  } catch (error) {
    console.error('Discord link error:', error)
    return NextResponse.json(
      { error: 'Failed to link Discord account' },
      { status: 500 }
    )
  }
}

// Unlink Discord account
export async function DELETE(req: Request) {
  try {
    const { userId } = auth()
    
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
    
    // Remove Discord ID
    await supabaseAdmin
      .from('users')
      .update({ discord_id: null })
      .eq('id', user.id)
    
    // Log
    await logAudit('discord_unlinked', userId, {}, req)
    
    return NextResponse.json({
      success: true,
      message: 'Discord unlinked successfully'
    })
    
  } catch (error) {
    console.error('Discord unlink error:', error)
    return NextResponse.json(
      { error: 'Failed to unlink Discord account' },
      { status: 500 }
    )
  }
}