/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async redirects() {
    return [
      // Dawne demo lekcji (/1, /2, …) zastąpione fiszkami zestawów.
      { source: '/:lesson(\\d+)', destination: '/', permanent: false },
    ];
  },
};

module.exports = nextConfig;
