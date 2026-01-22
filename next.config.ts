import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ensure proper file tracing for Vercel
  experimental: {
    // Remove or comment out any outputFileTracingRoot settings
  },
  
  // Explicitly tell Next.js to include middleware in the build
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
};

export default nextConfig;