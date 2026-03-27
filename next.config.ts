import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  // Prepared for blockchain / MONAD integration in v2
  experimental: {
    // serverActions enabled by default in Next.js 15
  },
};

export default nextConfig;
