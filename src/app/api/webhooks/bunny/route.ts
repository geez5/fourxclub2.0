import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Bunny Stream sends video status updates
    console.log('Bunny webhook received:', data)
    
    // Handle video upload complete
    if (data.Status === 4) { // Status 4 = encoding complete
      console.log('Video encoding complete:', data.VideoLibraryId, data.VideoGuid)
      
      // You can update your database here if needed
      // For now, just log it
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Bunny webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
// Webhook URL: https://fourxclub.in/api/webhooks/bunny
