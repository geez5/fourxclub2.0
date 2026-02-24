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
 * 1. Upload your 10 videos to your Bunny Stream Library (ID: 589918)
 * 2. Get the Video ID for each video from the Bunny dashboard
 * 3. Replace REPLACE_WITH_BUNNY_ID_X with actual IDs
 */
export const courseVideos: CourseVideo[] = [
  {
    id: 1,
    title: 'Basics of Orderflow and Correlation of Equities and Currencies',
    description: 'Understanding orderflow fundamentals and how equities correlate with currencies',
    duration: '15:30',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_1',
    thumbnail: '/thumbnails/video-1.jpg',
  },
  {
    id: 2,
    title: 'Market Structure and Time Frames',
    description: 'How to read market structure across different time frames',
    duration: '22:45',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_2',
    thumbnail: '/thumbnails/video-2.jpg',
  },
  {
    id: 3,
    title: 'Sessions, Volatility and Volume',
    description: 'Trading sessions, volatility patterns, and volume analysis',
    duration: '28:00',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_3',
    thumbnail: '/thumbnails/video-3.jpg',
  },
  {
    id: 4,
    title: 'Risk Management',
    description: 'Position sizing, stop losses, and protecting your capital',
    duration: '20:15',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_4',
    thumbnail: '/thumbnails/video-4.jpg',
  },
  {
    id: 5,
    title: '(Intermediate) Trading View Tools for Order Flow Model',
    description: 'Using TradingView tools to build and analyse order flow models',
    duration: '25:30',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_5',
    thumbnail: '/thumbnails/video-5.jpg',
  },
  {
    id: 6,
    title: 'Liquidity',
    description: 'Understanding liquidity pools and how smart money operates',
    duration: '18:45',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_6',
    thumbnail: '/thumbnails/video-6.jpg',
  },
  {
    id: 7,
    title: 'Advanced Liquidity',
    description: 'Advanced concepts in liquidity hunting and manipulation',
    duration: '24:00',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_7',
    thumbnail: '/thumbnails/video-7.jpg',
  },
  {
    id: 8,
    title: 'Full Strategy',
    description: 'The complete FourXclub trading strategy from A to Z',
    duration: '30:15',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_8',
    thumbnail: '/thumbnails/video-8.jpg',
  },
  {
    id: 9,
    title: 'GER30 Strategy (Bonus)',
    description: 'Bonus strategy specifically designed for trading GER30',
    duration: '22:00',
    bunnyId: 'REPLACE_WITH_BUNNY_ID_9',
    thumbnail: '/thumbnails/video-9.jpg',
  },
  {
    id: 10,
    title: 'NASDAQ Strategy (Bonus)',
    description: 'Bonus strategy specifically designed for trading NASDAQ',
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
  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || '589918'
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${bunnyId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`
}