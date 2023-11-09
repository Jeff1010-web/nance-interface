export const TEXT_CHANNEL = 0;
export const MANAGE_GUILD = 1 << 5;

export const DISCORD_OAUTH_URL = 'https://discord.com/api/oauth2/token';
export const avatarBaseUrl = "https://cdn.discordapp.com/avatars";
export const guildIconBaseUrl = "https://cdn.discordapp.com/icons";

export const USER_COMMANDS = {
  user: "users/@me",
  guilds: "users/@me/guilds",
};

export const BOT_COMMANDS = {
  channels: "guilds/{guildId}/channels",
  member: "guilds/{guildId}/members",
  roles: "guilds/{guildId}/roles",
};
