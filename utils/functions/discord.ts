import {
  MANAGE_GUILD,
  GUILD_TEXT_CHANNEL,
  BOT_COMMANDS,
  GUILD_ANNOUNCEMENT_CHANNEL,
} from "@/constants/Discord";
import {
  discordAuthUrl,
  getGuildIconUrl,
  DISCORD_PROXY_BOT_URL,
} from "@/utils/functions/discordURL";
import {
  DiscordGuild,
  DiscordRole,
  DiscordChannel,
} from "@/models/DiscordTypes";
import { DiscordConfig } from "@nance/nance-sdk";

export function openInDiscord(url: string) {
  try {
    // use URL object to replace https:// with discord://
    const discordUrl = new URL(url);
    discordUrl.protocol = "discord:";
    return discordUrl.toString();
  } catch (error) {
    return url;
  }
}

export function discordContactMessage(form: {
  name: string;
  email: string;
  message: string;
}) {
  const body = {
    embeds: [
      {
        title: "New Message from nance.app",
        description: `At <t:${Math.floor(Date.now() / 1000)}>:`,
        color: 0xeff6ff,
        fields: [
          {
            name: "Name",
            value: form.name ? form.name : "No name provided.",
            inline: false,
          },
          {
            name: "Contact",
            value: form.email ? form.email : "No contact provided.",
            inline: true,
          },
          {
            name: "Message",
            value: form.message,
            inline: false,
          },
        ],
      },
    ],
  };
  return body;
}

export const discordAuthWindow = (csrf: string, address: string) => {
  return window.open(
    discordAuthUrl(csrf, address),
    "_blank",
    "width=400,height=700,noopener,noreferrer",
  );
};

const appendSymbol = (str: string, append: string) => {
  if (str.startsWith(append)) return str;
  return `${append}${str}`;
};

// Discord API returns a message object if there is an error,
// using the detection of the message object to determine if there is an error, could be done better
export const managedGuildsOf = (guilds?: DiscordGuild[]): DiscordGuild[] => {
  if (!guilds || guilds.length === 0 || (guilds as any).message) return []; // error from Discord API
  return guilds
    .filter(
      (guild) => (Number(guild.permissions) & MANAGE_GUILD) === MANAGE_GUILD,
    )
    .map((guild) => {
      return { ...guild, icon: getGuildIconUrl(guild) };
    });
};

export const formatRoles = (roles?: DiscordRole[]): DiscordRole[] => {
  if (!roles || roles.length === 0 || (roles as any).message) return []; // error from Discord API
  return roles
    .map((role) => {
      return { ...role, name: appendSymbol(role.name, "@") };
    })
    .sort((a, b) => a.name.localeCompare(b.name)); // sort alphabetically
};

export const formatChannels = (
  channels?: DiscordChannel[],
): DiscordChannel[] => {
  if (!channels || channels.length === 0 || (channels as any).message)
    // error from Discord API
    return [];
  return channels
    .filter(
      (channel) =>
        channel.type === GUILD_TEXT_CHANNEL ||
        channel.type === GUILD_ANNOUNCEMENT_CHANNEL,
    )
    .map((channel) => {
      return { ...channel, name: appendSymbol(channel.name, "# ") };
    })
    .sort((a, b) => a.name.localeCompare(b.name)); // sort alphabetically
};

// TODO: what can this be used?
export async function fetchDiscordInitialValues(args: {
  address?: string | null;
  discordConfig: DiscordConfig;
  guilds?: DiscordGuild[];
}) {
  const { guildId } = args?.discordConfig;
  let guild = args?.guilds?.find((guild) => guild.id === guildId);
  if (guild) guild = managedGuildsOf([guild])[0];

  const channelsCommand = BOT_COMMANDS.channels.replace("{guildId}", guildId);
  const channels: DiscordChannel[] = await fetch(
    `${DISCORD_PROXY_BOT_URL}?command=${channelsCommand}`,
  ).then((res) => res.json());
  let proposalChannel = channels.find(
    (channel) => channel.id === args?.discordConfig.channelIds.proposals,
  );
  if (proposalChannel)
    proposalChannel = { ...proposalChannel, name: `# ${proposalChannel.name}` };

  let alertChannel = channels.find(
    (channel) => channel.id === args?.discordConfig.reminder.channelIds[0],
  );
  if (alertChannel)
    alertChannel = { ...alertChannel, name: `# ${alertChannel.name}` };

  const rolesCommand = BOT_COMMANDS.roles.replace("{guildId}", guildId);
  const roles: DiscordRole[] = await fetch(
    `${DISCORD_PROXY_BOT_URL}?command=${rolesCommand}`,
  ).then((res) => res.json());
  let role = roles.find(
    (role) => role.id === args?.discordConfig.roles.governance,
  );
  if (role) role = formatRoles([role])[0];

  return { guild, proposalChannel, alertChannel, role };
}
