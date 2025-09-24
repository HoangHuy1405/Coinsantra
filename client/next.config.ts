import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // devIndicators: false
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
};

export default nextConfig;
