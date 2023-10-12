export const DISCORD_OAUTH_URL = 'https://discord.com/api/oauth2/token';

export const discordRedirectBaseUrl = `${process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI_BASE}/api/discord/auth`;

export const discordScope = ["identify", "guilds"].join(" ");

export const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;

export const discordAuthUrl = () => {
  const url = "https://discord.com/api/oauth2/authorize" +
  `?client_id=${DISCORD_CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent(`${discordRedirectBaseUrl}`)}&` +
  `response_type=code&scope=${encodeURIComponent(discordScope)}`;
  return url;
};
const botPermissions = 326418033728; // https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
export const addBotUrl = (guildId: string) => {
  return `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&guild_id=${guildId}&permissions=${botPermissions}&scope=bot`;
};

export const avatarBaseUrl = "https://cdn.discordapp.com/avatars";

export const guildIconBaseUrl = "https://cdn.discordapp.com/icons";

export const DISCORD_PROXY_API_URL = "/api/discord";

export const DISCORD_PROXY_AUTH_SUCCESS_URL = `${DISCORD_PROXY_API_URL}/authSuccess`;

export const DISCORD_PROXY_USER_URL = `${DISCORD_PROXY_API_URL}/user`;

export const DISCORD_PROXY_BOT_URL = `${DISCORD_PROXY_API_URL}/bot`;

export const DISCORD_PROXY_LOGOUT_URL = `${DISCORD_PROXY_API_URL}/logout`;

export const LOCAL_STORAGE_KEY_DISCORD_STATUS = 'DISCORD_AUTH_STATUS';
