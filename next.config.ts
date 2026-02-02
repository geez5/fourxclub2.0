import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Simple config for Next.js 15
  eslint: {
    // Warning: This allows production builds to complete even with ESLint warnings
    ignoreDuringBuilds: true,
  },
  images: {
    // Allow unoptimized images for simpler deployment
    unoptimized: true,
  },
};

export default nextConfig;