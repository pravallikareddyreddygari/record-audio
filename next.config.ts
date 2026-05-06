import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    webpackBuildWorker: true,
  },
  turbopack: false,
};

export default nextConfig;
