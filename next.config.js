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
    ]
  },
  async rewrites() {
    return [
      {
        source: '/edit',
        destination: '/s/juicebox/edit',
      },
      {
        source: '/p/:path',
        destination: '/s/juicebox/:path',
      },
    ];
  }
}

module.exports = removeImports(nextConfig)
