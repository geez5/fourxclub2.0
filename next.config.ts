import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Add empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;