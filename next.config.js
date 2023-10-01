/** @type {import('next').NextConfig} */
const removeImports = require('next-remove-imports')();
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'http.cat'
      },
      {
        protocol: 'https',
        hostname: 'cdn.stamp.fyi'
      },
      {
        protocol: 'https',
        hostname: 'jbm.infura-ipfs.io'
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com'
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'www.jbdao.org',
          },
        ],
        destination: '/s/juicebox',
      },
      {
        source: '/edit',
        has: [
          {
            type: 'host',
            value: 'www.jbdao.org',
          },
        ],
        destination: '/s/juicebox/edit',
      },
      {
        source: '/p/:slug',
        has: [
          {
            type: 'host',
            value: 'www.jbdao.org',
          },
        ],
        destination: '/s/juicebox/:slug',
      },
    ]
  },
};

module.exports = removeImports(nextConfig);
