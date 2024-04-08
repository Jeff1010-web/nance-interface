/** @type {import('next').NextConfig} */
const removeImports = require("next-remove-imports")();
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "http.cat",
      },
      {
        protocol: "https",
        hostname: "cdn.stamp.fyi",
      },
      {
        protocol: "https",
        hostname: "jbm.infura-ipfs.io",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "guild-xyz.mypinata.cloud",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/s/juicebox",
        permanent: false,
        has: [
          {
            type: "host",
            value: "www.jbdao.org",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/edit",
        has: [
          {
            type: "host",
            value: "www.jbdao.org",
          },
        ],
        destination: "/s/juicebox/edit",
      },
      {
        source: "/p/:slug",
        has: [
          {
            type: "host",
            value: "www.jbdao.org",
          },
        ],
        destination: "/s/juicebox/:slug",
      },
      {
        source: "/:slug(\\d{1,})",
        has: [
          {
            type: "host",
            value: "www.jbdao.org",
          },
        ],
        destination: "/s/juicebox/:slug",
      },
    ];
  },
};

module.exports = removeImports(nextConfig);

