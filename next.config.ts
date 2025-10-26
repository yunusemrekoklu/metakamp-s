import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Mobil erişim için CORS ayarları
  allowedDevOrigins: ["192.168.1.19:3000", "localhost:3000", "127.0.0.1:3000"],
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Vercel build fix for Tailwind CSS v4
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

export default nextConfig;
