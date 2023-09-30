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
  async redirects() {
    return [
      {
        source: '/proposal/:slug',
        destination: '/:slug',
        permanent: true,
        has: [
          {
            type: 'host',
            value: 'www.jbdao.org',
          },
        ],
      },
      {
        source: '/snapshot/:slug',
        destination: '/:slug',
        permanent: true,
        has: [
          {
            type: 'host',
            value: 'www.jbdao.org',
          },
        ],
      },
      {
        source: '/snapshot/jbdao.eth/proposal/:slug',
        destination: '/:slug',
        permanent: true,
        has: [
          {
            type: 'host',
            value: 'www.jbdao.org',
          },
        ],
      },
      {
        source: '/p/:path',
        destination: '/:path',
        permanent: true,
        has: [
          {
            type: 'host',
            value: 'www.jbdao.org',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:slug*',
        has: [
          {
            type: 'host',
            value: 'www.jbdao.org',
          },
        ],
        destination: '/s/juicebox/:slug*',
      },
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
    ]
  },
};

module.exports = removeImports(nextConfig);
