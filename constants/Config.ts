/**
 * Gets a field from the environment and logs an error if it is not found
 * @param {string} field - The field to get from the environment
 * @param {boolean} optional - Whether the field is optional
 * @param {string} defaultValue - The default value to use if the field is not found
 * @param {string} message - The message to display if the field is not found
 */
function getEnv(
  field: string,
  optional: boolean = true,
  defaultValue: string = "",
  message: string = "",
) {
  const value = process.env[field];
  if (!value) {
    if (optional) {
      console.warn(
        `Environment variable ${field} is not set. Defaults to ${defaultValue}. ${message}`,
      );
    } else {
      console.error(
        `Environment variable ${field} is not set. Defaults to ${defaultValue}. ${message}`,
      );
    }
  }
  return value || defaultValue;
}

function getOptionalEnv(
  field: string,
  defaultValue: string = "",
  message: string = "",
) {
  return getEnv(field, true, defaultValue, message);
}

function getRequiredEnv(
  field: string,
  defaultValue: string = "",
  message: string = "",
) {
  return getEnv(field, false, defaultValue, message);
}

const CONFIG = {
  node: {
    env: getOptionalEnv("NODE_ENV"),
  },
  vercel: {
    commit: getOptionalEnv("NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA"),
  },
  // Core API to interface with Nance backend
  nance: {
    apiUrl: getRequiredEnv(
      "NEXT_PUBLIC_NANCE_API_URL",
      "https://api.nance.app",
    ),
  },
  // Wallet connecting and signing
  walletConnect: {
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  },
  nextAuth: {
    domains: getRequiredEnv("NEXTAUTH_DOMAINS").split(","),
    secret: getRequiredEnv("NEXTAUTH_SECRET"),
  },
  infura: {
    key: getRequiredEnv("NEXT_PUBLIC_INFURA_KEY"),
  },
  // Snapshot API
  snapshot: {
    apiKey: getOptionalEnv("NEXT_PUBLIC_SNAPSHOT_API_KEY"),
    subgraphId: getOptionalEnv("NEXT_PUBLIC_SNAPSHOT_SUBGRAPH_ID"),
  },
  // Upload image to IPFS
  ipfs: {
    id: getOptionalEnv("NEXT_PUBLIC_INFURA_IPFS_ID"),
    secret: getOptionalEnv("NEXT_PUBLIC_INFURA_IPFS_SECRET"),
  },
  // Juicebox subgraph
  juicebox: {
    subgraphKey: getOptionalEnv("JUICEBOX_SUBGRAPH_KEY"),
  },
  // Tenderly simulation
  tenderly: {
    accessKey: getOptionalEnv("TENDERLY_ACCESS_KEY"),
  },
  // Etherscan API
  etherscan: {
    key: getOptionalEnv("NEXT_PUBLIC_ETHERSCAN_KEY"),
  },
  // Discord integration
  discord: {
    botKey: getRequiredEnv("DISCORD_BOT_KEY"),
    clientId: getRequiredEnv("NEXT_PUBLIC_DISCORD_CLIENT_ID"),
    clientSecret: getRequiredEnv("DISCORD_CLIENT_SECRET"),
    contactWebhook: getRequiredEnv("DISCORD_CONTACT_WEBHOOK"),
    redirectUriBase: getRequiredEnv("NEXT_PUBLIC_DISCORD_REDIRECT_URI_BASE"),
  },
  // Redis
  redis: {
    host: getRequiredEnv("REDIS_HOST"),
    port: getRequiredEnv("REDIS_PORT"),
    password: getRequiredEnv("REDIS_PASSWORD"),
  },
} as const;

export default CONFIG;
