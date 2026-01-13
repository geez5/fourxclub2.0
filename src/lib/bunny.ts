export type VideoInfo = {
  bunnyId: string
  title: string
  description?: string
  duration?: number // seconds
}

/**
 * Simple list of course videos (10 items to match validation in route.ts).
 * Replace bunnyId values with actual IDs from your Bunny Stream library.
 */
export const courseVideos: VideoInfo[] = Array.from({ length: 10 }, (_, i) => ({
  bunnyId: `video-${i + 1}`,
  title: `Video ${i + 1}`,
  description: `Description for video ${i + 1}`,
  duration: 300 + i * 30
}))

/**
 * Generate a signed/parameterized Bunny Stream URL.
 * This implementation returns a URL with watermark and expiry params.
 * Replace with your proper signing implementation if needed.
 */
export function generateBunnySignedUrl(
  bunnyId: string,
  watermarkText: string,
  expiryHours = 2
): string {
  const base = process.env.BUNNY_STREAM_BASE_URL || 'https://video.bunnycdn.com'
  const apiKey = process.env.BUNNY_STREAM_API_KEY || 'dev'
  const expires = Math.floor(Date.now() / 1000) + expiryHours * 3600
  const wm = encodeURIComponent(watermarkText)
  // NOTE: For real security, implement Bunny Stream signing/HMAC using your secret.
  return `${base}/${bunnyId}?watermark=${wm}&expires=${expires}&token=${apiKey}`
}