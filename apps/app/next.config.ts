import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/ui', '@repo/db'],
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    esmExternals: 'loose',
  },

  // webpack: (config, { isServer }) => {
  //   if (isServer) {
  //     // config.externals.push('@prisma/client');
  //   }
  // return config;
  // },
};

export default nextConfig;
