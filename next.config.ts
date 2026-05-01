import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    webpackBuildWorker: true,
  },
};

export default nextConfig;
