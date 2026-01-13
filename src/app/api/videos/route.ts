import { NextResponse, NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateVideoToken } from '@/lib/videoTokens'
import { generateBunnySignedUrl, courseVideos } from '@/lib/bunny'

export async function GET(
  req: NextRequest,
  { params }: { params: { videoNumber: string } }
) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const videoNumber = parseInt(params.videoNumber)
    
    // Validate video number
    if (isNaN(videoNumber) || videoNumber < 1 || videoNumber > 10) {
      return NextResponse.json(
        { error: 'Invalid video number' },
        { status: 400 }
      )
    }
    
    // Get user from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('clerk_id', userId)
      .single()
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if user has purchased the course
    const { data: purchase } = await supabaseAdmin
      .from('course_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single()
    
    if (!purchase) {
      return NextResponse.json(
        { error: 'Course not purchased', code: 'NOT_PURCHASED' },
        { status: 403 }
      )
    }
    
    // Generate access token
    const token = await generateVideoToken(user.id, videoNumber)
    
    // Get video info
    const video = courseVideos[videoNumber - 1]
    
    // Get signed Bunny Stream URL with watermark
    const bunnyUrl = generateBunnySignedUrl(
      video.bunnyId, 
      user.email, 
      2 // 2 hours expiry
    )
    
    // Log access
    // await logAudit('video_accessed', userId, {
    //   videoNumber,
    //   videoTitle: video.title
    // }, req)
    
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
  { params }: { params: { videoNumber: string } }
) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const videoNumber = parseInt(params.videoNumber)
    const { progressSeconds, completed } = await req.json()
    
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
    
    // Update or insert progress
    await supabaseAdmin
      .from('video_progress')
      .upsert({
        user_id: user.id,
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