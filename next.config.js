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
        destination: '/p/:slug',
        permanent: true,
      },
      {
        source: '/snapshot/:slug',
        destination: '/p/:slug',
        permanent: true,
      },
      {
        source: '/snapshot/jbdao.eth/proposal/:slug',
        destination: '/p/:slug',
        permanent: true,
      },
      {
        source: '/p/:path',
        destination: '/s/juicebox/:path',
        permanent: true,
      },
      {
        source: '/edit',
        destination: '/s/juicebox/edit',
        permanent: true,
      },
    ];
  }
};

module.exports = removeImports(nextConfig);
