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

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "nance-w2",
    project: "nance-interface",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  },
);
