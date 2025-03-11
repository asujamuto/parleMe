/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: false,
  images: { unoptimized: true },
};

module.exports = nextConfig;
