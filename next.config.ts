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
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
