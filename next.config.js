/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./lib/i18n.ts');

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude functions directory from webpack build
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules', '**/functions/**'],
    };
    return config;
  },
};

module.exports = withNextIntl(nextConfig);
