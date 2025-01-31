import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // src="https://res.cloudinary.com/dthqgnlbt/image/upload/v1733331537/Still_16_dqnyod.jpg"
      {
        protocol: 'https',
        // hostname: 'ausrealty-next.s3.ap-southeast-2.amazonaws.com',
        hostname: '*',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
