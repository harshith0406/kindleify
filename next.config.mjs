/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ['epub2'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      zipfile: false,
    };
    return config;
  },
};

export default nextConfig;
