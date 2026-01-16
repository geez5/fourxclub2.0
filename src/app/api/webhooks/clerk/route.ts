import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Get Svix headers for verification
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env')
  }
  
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 })
  }
  
  const payload = await req.json()
  const body = JSON.stringify(payload)
  
  // Create Svix instance
  const wh = new Webhook(WEBHOOK_SECRET)
  
  let evt: WebhookEvent
  
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error: Verification failed', { status: 400 })
  }
  
  // Handle the webhook
  const eventType = evt.type
  
  try {
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data
      
      // Create user in our database
      await supabaseAdmin.from('users').insert({
        clerk_id: id,
        email: email_addresses[0].email_address,
        full_name: `${first_name || ''} ${last_name || ''}`.trim()
      })
      
      console.log(`✅ User created: ${id}`)
    }
    
    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data
      
      // Update user in our database
      await supabaseAdmin
        .from('users')
        .update({
          email: email_addresses[0].email_address,
          full_name: `${first_name || ''} ${last_name || ''}`.trim()
        })
        .eq('clerk_id', id)
      
      console.log(`✅ User updated: ${id}`)
    }
    
    if (eventType === 'user.deleted') {
      const { id } = evt.data
      
      // Delete user from our database (cascade will delete related data)
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('clerk_id', id!)
      
      console.log(`✅ User deleted: ${id}`)
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