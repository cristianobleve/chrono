import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/@:username",
        destination: "/u/@:username",
      },
    ];
  },
};

export default nextConfig;
