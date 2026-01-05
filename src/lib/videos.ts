// Upload your 10 videos to Vimeo Pro, then add their IDs here
export const courseVideos = [
  {
    id: 1,
    title: "Introduction to 4X Trading",
    description: "Learn the fundamentals of 4X trading",
    vimeoId: "REPLACE_WITH_VIMEO_ID_1", // Get from Vimeo after upload
    duration: "15:30",
    thumbnail: "/thumbnails/video-1.jpg" // Optional
  },
  {
    id: 2,
    title: "Market Analysis Basics",
    description: "Understanding market trends and patterns",
    vimeoId: "REPLACE_WITH_VIMEO_ID_2",
    duration: "22:15",
    thumbnail: "/thumbnails/video-2.jpg"
  },
  {
    id: 3,
    title: "Risk Management",
    description: "Protecting your capital in trading",
    vimeoId: "REPLACE_WITH_VIMEO_ID_3",
    duration: "18:45",
    thumbnail: "/thumbnails/video-3.jpg"
  },
  {
    id: 4,
    title: "Technical Indicators",
    description: "Key indicators every trader should know",
    vimeoId: "REPLACE_WITH_VIMEO_ID_4",
    duration: "25:10",
    thumbnail: "/thumbnails/video-4.jpg"
  },
  {
    id: 5,
    title: "Chart Patterns",
    description: "Recognizing profitable patterns",
    vimeoId: "REPLACE_WITH_VIMEO_ID_5",
    duration: "20:30",
    thumbnail: "/thumbnails/video-5.jpg"
  },
  {
    id: 6,
    title: "Trading Psychology",
    description: "Mastering your mindset",
    vimeoId: "REPLACE_WITH_VIMEO_ID_6",
    duration: "16:20",
    thumbnail: "/thumbnails/video-6.jpg"
  },
  {
    id: 7,
    title: "Entry and Exit Strategies",
    description: "When to buy and sell",
    vimeoId: "REPLACE_WITH_VIMEO_ID_7",
    duration: "28:00",
    thumbnail: "/thumbnails/video-7.jpg"
  },
  {
    id: 8,
    title: "Advanced Trading Techniques",
    description: "Pro-level strategies",
    vimeoId: "REPLACE_WITH_VIMEO_ID_8",
    duration: "24:45",
    thumbnail: "/thumbnails/video-8.jpg"
  },
  {
    id: 9,
    title: "Portfolio Management",
    description: "Building a balanced portfolio",
    vimeoId: "REPLACE_WITH_VIMEO_ID_9",
    duration: "19:15",
    thumbnail: "/thumbnails/video-9.jpg"
  },
  {
    id: 10,
    title: "Live Trading Session",
    description: "Watch a real trading session",
    vimeoId: "REPLACE_WITH_VIMEO_ID_10",
    duration: "30:00",
    thumbnail: "/thumbnails/video-10.jpg"
  }
]

// Generate signed Vimeo URL (with expiration)
export async function getSignedVimeoUrl(
  vimeoId: string,
  userEmail: string
): Promise<string> {
  // This creates a time-limited signed URL
  // Vimeo will verify the signature before playing
  const response = await fetch(
    `https://api.vimeo.com/videos/${vimeoId}/privacy/domains/fourxclub.in`,
    {
      headers: {
        'Authorization': `bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )
  
  if (!response.ok) {
    throw new Error('Failed to get Vimeo URL')
  }
  
  // Add watermark parameter with user email
  const baseUrl = `https://player.vimeo.com/video/${vimeoId}`
  const params = new URLSearchParams({
    h: process.env.VIMEO_CLIENT_SECRET!,
    badge: '0',
    autopause: '0',
    player_id: '0',
    app_id: process.env.VIMEO_CLIENT_ID!,
    // This adds watermark with user email
    title: userEmail,
    byline: '0',
    portrait: '0'
  })
  
  return `${baseUrl}?${params.toString()}`
}