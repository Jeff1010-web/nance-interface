/** @type {import('next').NextConfig} */
const removeImports = require('next-remove-imports')();
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    images: {
      unoptimized: true,
    },
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
  }
}

module.exports = removeImports(nextConfig)
