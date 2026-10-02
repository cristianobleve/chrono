import type { NextConfig } from "next";

const isDesktop = process.env.NEXT_PUBLIC_IS_DESKTOP === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: isDesktop ? "export" : undefined,
  images: {
    unoptimized: isDesktop ? true : undefined,
  },
  ...(isDesktop
    ? {}
    : {
        async rewrites() {
          return [
            {
              source: "/@:username",
              destination: "/u/@:username",
            },
          ];
        },
      }),
};

export default nextConfig;
