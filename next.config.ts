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
  // Vercel build optimization for Tailwind CSS v4
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
  // CSS optimization for Vercel
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // PostCSS and Tailwind CSS v4 compatibility
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
