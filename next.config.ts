import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    domains: ["*"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    unoptimized: true, // Permet les images non optimisées, y compris data URLs
  },
};

export default nextConfig;
