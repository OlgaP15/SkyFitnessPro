import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
  reactStrictMode: true,
  // Явно указываем корневую директорию для Turbopack
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;