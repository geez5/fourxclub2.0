import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { courseVideos, generateBunnyEmbedUrl } from '@/lib/bunny'

type RouteContext = {
  params: Promise<{ videoNumber: string }>
}

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { videoNumber } = await context.params
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Validate video number
    const videoNum = parseInt(videoNumber)
    if (isNaN(videoNum) || videoNum < 1 || videoNum > 10) {
      return NextResponse.json(
        { error: 'Invalid video number. Must be between 1 and 10.' },
        { status: 400 }
      )
    }

    // Check if user has paid access
    const courseAccess = await prisma.courseAccess.findFirst({
      where: {
        userId,
        status: 'active',
      },
    })

    if (!courseAccess) {
      return NextResponse.json(
        {
          error: 'Access denied. Please purchase the course to watch videos.',
          requiresPurchase: true
        },
        { status: 403 }
      )
    }

    // Get video info
    const video = courseVideos.find((v) => v.id === videoNum)
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Check if Bunny ID is configured
    if (video.bunnyId.startsWith('REPLACE_WITH_')) {
      return NextResponse.json(
        {
          error: 'Video not yet available. Please check back later.',
          videoInfo: {
            id: video.id,
            title: video.title,
            description: video.description,
            duration: video.duration,
          }
        },
        { status: 503 }
      )
    }

    // Generate secure embed URL
    const embedUrl = generateBunnyEmbedUrl(video.bunnyId)

    // Log video access for analytics
    await prisma.userActivity.create({
      data: {
        userId,
        action: 'video_watched',
        metadata: {
          videoId: video.id,
          videoTitle: video.title,
          provider: 'bunny',
          timestamp: new Date().toISOString(),
        },
      },
    }).catch((err) => {
      console.error('Failed to log video activity:', err)
    })

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        duration: video.duration,
        embedUrl,
        thumbnail: video.thumbnail,
      },
    })
  } catch (error) {
    console.error('Video route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}