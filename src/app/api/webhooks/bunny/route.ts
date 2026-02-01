import { NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { prisma } from '@/lib/prisma'

/**
 * Bunny CDN Webhook Handler
 * 
 * This webhook handles events from Bunny CDN, such as video processing completion
 * or other CDN-related events.
 */

interface BunnyWebhookEvent {
  VideoLibraryId?: number
  VideoGuid?: string
  Status?: number
  // Add other Bunny CDN webhook fields as needed
}

export async function POST(req: Request) {
  try {
    // Verify the webhook is from Bunny CDN
    const bunnyWebhookSecret = process.env.BUNNY_WEBHOOK_SECRET

    if (bunnyWebhookSecret) {
      const signature = req.headers.get('x-bunny-signature')

      if (!signature || signature !== bunnyWebhookSecret) {
        console.error('Invalid Bunny CDN webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const event: BunnyWebhookEvent = await req.json()
    console.log('Bunny CDN webhook event received:', event)

    // Handle the webhook event based on your needs
    // Example: Video processing completed
    if (event.Status === 4) { // Status 4 typically means "Ready"
      console.log('Video processing completed:', event.VideoGuid)

      // Update your database or perform other actions
      // For example:
      // await prisma.video.update({
      //   where: { bunnyGuid: event.VideoGuid },
      //   data: { status: 'ready' }
      // })
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Bunny CDN webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}