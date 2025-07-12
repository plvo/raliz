import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/ui', '@repo/db', '@repo/contracts'],
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    esmExternals: 'loose',
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // webpack: (config, { isServer }) => {
  //   if (isServer) {
  //     // config.externals.push('@prisma/client');
  //   }
  // return config;
  // },
};

export default nextConfig;
