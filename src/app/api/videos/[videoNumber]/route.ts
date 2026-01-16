import { NextResponse, NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server' // Import both auth and currentUser
import { supabaseAdmin } from '@/lib/supabase'
import { generateVideoToken } from '@/lib/videoTokens'
import { generateBunnySignedUrl, courseVideos } from '@/lib/bunny'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoNumber: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Await params
    const { videoNumber: videoNumberStr } = await params
    const videoNumber = parseInt(videoNumberStr)
    
    // Validate video number
    if (isNaN(videoNumber) || videoNumber < 1 || videoNumber > 10) {
      return NextResponse.json(
        { error: 'Invalid video number' },
        { status: 400 }
      )
    }
    
    // Get user from database - renamed to dbUser to avoid conflict
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('clerk_id', userId)
      .single()
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if user has purchased the course
    const { data: purchase } = await supabaseAdmin
      .from('course_purchases')
      .select('id')
      .eq('user_id', dbUser.id)
      .eq('status', 'completed')
      .single()
    
    if (!purchase) {
      return NextResponse.json(
        { error: 'Course not purchased', code: 'NOT_PURCHASED' },
        { status: 403 }
      )
    }
    
    // Generate access token
    const token = await generateVideoToken(dbUser.id, videoNumber)
    
    // Get video info
    const video = courseVideos[videoNumber - 1]
    
    // Get signed Bunny Stream URL with watermark
    const bunnyUrl = generateBunnySignedUrl(
      video.bunnyId, 
      dbUser.email, 
      2 // 2 hours expiry
    )
    
    return NextResponse.json({
      token,
      videoUrl: bunnyUrl,
      videoInfo: {
        title: video.title,
        description: video.description,
        duration: video.duration
      },
      expiresIn: 7200 // 2 hours in seconds
    })
    
  } catch (error) {
    console.error('Video access error:', error)
    return NextResponse.json(
      { error: 'Failed to get video access' },
      { status: 500 }
    )
  }
}

// Update video progress
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ videoNumber: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Await params
    const { videoNumber: videoNumberStr } = await params
    const videoNumber = parseInt(videoNumberStr)
    const { progressSeconds, completed } = await req.json()
    
    // Get user
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Update or insert progress
    await supabaseAdmin
      .from('video_progress')
      .upsert({
        user_id: dbUser.id,
        video_number: videoNumber,
        progress_seconds: progressSeconds,
        completed: completed || false,
        last_watched: new Date().toISOString()
      })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Video progress error:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}