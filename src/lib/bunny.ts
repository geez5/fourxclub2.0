// src/lib/bunny.ts
// Bunny.net video access and integration library

export interface CourseVideo {
  id: number
  title: string
  description: string
  duration: string
  bunnyId: string // The Video ID from Bunny Stream
  thumbnail?: string
}

/**
 * Course videos configuration for Bunny.net
 * 
 * INSTRUCTIONS:
 * 1. Upload your 10 videos to your Bunny Stream Library (ID: 578760)
 * 2. Get the Video ID for each video from the Bunny dashboard
 * 3. Replace REPLACE_WITH_BUNNY_ID_X with actual IDs
 */
export const courseVideos: CourseVideo[] = [
  {
    id: 1,
    title: 'Introduction to Forex Trading',
    description: 'Basics of forex trading and market fundamentals',
    duration: '15:30',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_1',
    thumbnail: '/thumbnails/video-1.jpg',
  },
  {
    id: 2,
    title: 'Understanding Currency Pairs',
    description: 'Major, minor, and exotic currency pairs explained',
    duration: '22:45',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_2',
    thumbnail: '/thumbnails/video-2.jpg',
  },
  {
    id: 3,
    title: 'Technical Analysis Basics',
    description: 'Charts, candlesticks, and reading market data',
    duration: '28:00',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_3',
    thumbnail: '/thumbnails/video-3.jpg',
  },
  {
    id: 4,
    title: 'Support and Resistance',
    description: 'Identifying key levels for entry and exit',
    duration: '20:15',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_4',
    thumbnail: '/thumbnails/video-4.jpg',
  },
  {
    id: 5,
    title: 'Trend Trading Strategies',
    description: 'How to identify and trade with the trend',
    duration: '25:30',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_5',
    thumbnail: '/thumbnails/video-5.jpg',
  },
  {
    id: 6,
    title: 'Risk Management',
    description: 'Position sizing and protecting your capital',
    duration: '18:45',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_6',
    thumbnail: '/thumbnails/video-6.jpg',
  },
  {
    id: 7,
    title: 'Trading Psychology',
    description: 'Managing emotions and maintaining discipline',
    duration: '24:00',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_7',
    thumbnail: '/thumbnails/video-7.jpg',
  },
  {
    id: 8,
    title: 'Advanced Chart Patterns',
    description: 'Head & shoulders, triangles, and more patterns',
    duration: '30:15',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_8',
    thumbnail: '/thumbnails/video-8.jpg',
  },
  {
    id: 9,
    title: 'Building Your Trading Plan',
    description: 'Creating a systematic trading approach',
    duration: '22:00',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_9',
    thumbnail: '/thumbnails/video-9.jpg',
  },
  {
    id: 10,
    title: 'Live Trading Session',
    description: 'Real trades with detailed commentary',
    duration: '45:00',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_10',
    thumbnail: '/thumbnails/video-10.jpg',
  },
]

/**
 * Generate secure Bunny.net embed URL
 * Note: Bunny Stream use a different signing method if enabled, 
 * but for basic domain-restricted embedding, a standard embed link works.
 */
export function generateBunnyEmbedUrl(bunnyId: string): string {
  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || '578760'
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${bunnyId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`
}