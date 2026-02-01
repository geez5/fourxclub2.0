import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

/**
 * Supabase Auth Webhook Handler
 * 
 * Setup Instructions:
 * 1. Go to Supabase Dashboard > Authentication > Hooks
 * 2. Enable "Send auth events to a webhook"
 * 3. Set webhook URL to: https://yourdomain.com/api/webhooks/supabase
 * 4. Set webhook secret in .env: SUPABASE_WEBHOOK_SECRET
 * 5. Select events: user.created, user.updated, user.deleted
 */

interface SupabaseAuthEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: {
    id: string
    email?: string
    email_confirmed_at?: string
    raw_user_meta_data?: {
      first_name?: string
      last_name?: string
      full_name?: string
      avatar_url?: string
      picture?: string
    }
    user_metadata?: {
      first_name?: string
      last_name?: string
      full_name?: string
      avatar_url?: string
      picture?: string
    }
  }
  old_record?: {
    id: string
  }
}

async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signatureBytes = Uint8Array.from(
      signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    )

    return await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(payload)
    )
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('SUPABASE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  try {
    const headerPayload = await headers()
    const signature = headerPayload.get('x-supabase-signature')

    if (!signature) {
      console.error('Missing webhook signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    const payload = await req.text()
    const isValid = await verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)

    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event: SupabaseAuthEvent = JSON.parse(payload)
    console.log('Webhook event received:', event.type, event.table)

    // Handle user creation
    if (event.type === 'INSERT' && event.table === 'users') {
      const { id, email, raw_user_meta_data, user_metadata } = event.record
      const metadata = raw_user_meta_data || user_metadata || {}

      // Construct full name from available metadata
      let fullName = metadata.full_name
      if (!fullName && (metadata.first_name || metadata.last_name)) {
        fullName = [metadata.first_name, metadata.last_name]
          .filter(Boolean)
          .join(' ')
      }

      try {
        await prisma.user.create({
          data: {
            id: id,
            email: email || '',
            fullName: fullName || null,
          },
        })

        console.log('User created successfully:', id)
        return NextResponse.json({ message: 'User created' }, { status: 200 })
      } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
          { error: 'Error creating user' },
          { status: 500 }
        )
      }
    }

    // Handle user update
    if (event.type === 'UPDATE' && event.table === 'users') {
      const { id, email, raw_user_meta_data, user_metadata } = event.record
      const metadata = raw_user_meta_data || user_metadata || {}

      // Construct full name from available metadata
      let fullName = metadata.full_name
      if (!fullName && (metadata.first_name || metadata.last_name)) {
        fullName = [metadata.first_name, metadata.last_name]
          .filter(Boolean)
          .join(' ')
      }

      try {
        await prisma.user.update({
          where: { id: id },
          data: {
            email: email || undefined,
            fullName: fullName || undefined,
          },
        })

        console.log('User updated successfully:', id)
        return NextResponse.json({ message: 'User updated' }, { status: 200 })
      } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json(
          { error: 'Error updating user' },
          { status: 500 }
        )
      }
    }

    // Handle user deletion
    if (event.type === 'DELETE' && event.table === 'users') {
      const userId = event.old_record?.id

      if (!userId) {
        return NextResponse.json(
          { error: 'Missing user ID' },
          { status: 400 }
        )
      }

      try {
        await prisma.user.delete({
          where: { id: userId },
        })

        console.log('User deleted successfully:', userId)
        return NextResponse.json({ message: 'User deleted' }, { status: 200 })
      } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json(
          { error: 'Error deleting user' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}