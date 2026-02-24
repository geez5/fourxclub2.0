// src/lib/bunny.ts
// Bunny.net Stream API integration — fetches videos from the Bunny API

const BUNNY_API_BASE = 'https://video.bunnycdn.com';

export interface BunnyVideo {
  videoLibraryId: number;
  guid: string;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number; // seconds
  status: number;
  storageSize: number;
  encodeProgress: number;
  availableResolutions: string;
  thumbnailCount: number;
  category: string;
}

export interface CourseVideo {
  id: number;
  title: string;
  description: string;
  duration: string;
  bunnyGuid: string;
  embedUrl: string;
  thumbnail: string;
}

// Video title mapping — maps the sort position (1-based) to the display title & description
const VIDEO_METADATA: Record<number, { title: string; description: string }> = {
  1: { title: 'Basics of Orderflow and Correlation of Equities and Currencies', description: 'Understanding orderflow fundamentals and how equities correlate with currencies' },
  2: { title: 'Market Structure and Time Frames', description: 'How to read market structure across different time frames' },
  3: { title: 'Sessions, Volatility and Volume', description: 'Trading sessions, volatility patterns, and volume analysis' },
  4: { title: 'Risk Management', description: 'Position sizing, stop losses, and protecting your capital' },
  5: { title: '(Intermediate) Trading View Tools for Order Flow Model', description: 'Using TradingView tools to build and analyse order flow models' },
  6: { title: 'Liquidity', description: 'Understanding liquidity pools and how smart money operates' },
  7: { title: 'Advanced Liquidity', description: 'Advanced concepts in liquidity hunting and manipulation' },
  8: { title: 'Full Strategy', description: 'The complete FourXclub trading strategy from A to Z' },
  9: { title: 'GER30 Strategy (Bonus)', description: 'Bonus strategy specifically designed for trading GER30' },
  10: { title: 'NASDAQ Strategy (Bonus)', description: 'Bonus strategy specifically designed for trading NASDAQ' },
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Fetch all videos from Bunny Stream library via the Bunny API.
 * Uses BUNNY_API_KEY and BUNNY_LIBRARY_ID from environment variables.
 */
export async function fetchBunnyVideos(): Promise<CourseVideo[]> {
  const apiKey = process.env.BUNNY_API_KEY;
  const libraryId = process.env.BUNNY_LIBRARY_ID || '589918';

  if (!apiKey) {
    console.error('[Bunny] ❌ BUNNY_API_KEY is not set');
    throw new Error('Video service not configured');
  }

  console.log(`[Bunny] Fetching videos from library ${libraryId}`);

  const response = await fetch(
    `${BUNNY_API_BASE}/library/${libraryId}/videos?page=1&itemsPerPage=100&orderBy=date`,
    {
      headers: {
        'AccessKey': apiKey,
        'Accept': 'application/json',
      },
      // Cache for 5 minutes to avoid hammering the API
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Bunny] ❌ API error (${response.status}):`, errorText);
    throw new Error(`Failed to fetch videos from Bunny (${response.status})`);
  }

  const data = await response.json();
  const bunnyVideos: BunnyVideo[] = data.items || [];

  console.log(`[Bunny] ✅ Fetched ${bunnyVideos.length} videos`);

  // Map Bunny videos to our CourseVideo format
  // Sort by dateUploaded to maintain consistent ordering
  const sortedVideos = bunnyVideos
    .filter((v) => v.status >= 4) // Only include fully encoded videos
    .sort((a, b) => new Date(a.dateUploaded).getTime() - new Date(b.dateUploaded).getTime());

  return sortedVideos.map((video, index) => {
    const position = index + 1;
    const metadata = VIDEO_METADATA[position];

    return {
      id: position,
      title: metadata?.title || video.title,
      description: metadata?.description || '',
      duration: formatDuration(video.length),
      bunnyGuid: video.guid,
      embedUrl: generateBunnyEmbedUrl(video.guid, libraryId),
      thumbnail: `https://${process.env.BUNNY_CDN_HOSTNAME || 'vz-36a9a6d8-d84.b-cdn.net'}/${video.guid}/thumbnail.jpg`,
    };
  });
}

/**
 * Fetch a single video by position (1-based index).
 */
export async function fetchBunnyVideoById(videoId: number): Promise<CourseVideo | null> {
  const videos = await fetchBunnyVideos();
  return videos.find((v) => v.id === videoId) || null;
}

/**
 * Generate Bunny.net iframe embed URL.
 */
export function generateBunnyEmbedUrl(guid: string, libraryId?: string): string {
  const libId = libraryId || process.env.BUNNY_LIBRARY_ID || '589918';
  return `https://iframe.mediadelivery.net/embed/${libId}/${guid}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
}