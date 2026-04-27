import type { NextConfig } from "next";

const mapTarget = (process.env.MC_MAP_URL ?? "http://114.67.238.112:8123").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mc-heads.net",
      },
      {
        protocol: "https",
        hostname: "textures.minecraft.net",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/map-view",
        destination: `${mapTarget}/index.html`,
      },
      {
        source: "/map-view/:path*",
        destination: `${mapTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
