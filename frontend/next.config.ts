import type { NextConfig } from "next";

// Backend URL used for server-side proxying.
// Mobile devices only need to reach the Next.js server; it proxies to the backend internally.
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        // Allow locally-served images (localhost & LAN IPs)
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      // Proxy all API calls to the backend
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      // Proxy uploaded image files to the backend — fixes mobile image loading
      {
        source: '/uploads/:path*',
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
