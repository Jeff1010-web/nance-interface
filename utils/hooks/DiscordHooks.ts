import useSWR, { Fetcher } from 'swr';
import useSWRMutation from 'swr/mutation';
import { DiscordGuild, DiscordUser, DiscordChannel, DiscordRole } from '../../models/DiscordTypes';
import { DISCORD_PROXY_USER_URL, DISCORD_PROXY_BOT_URL, DISCORD_PROXY_LOGOUT_URL, DISCORD_CLIENT_ID } from "../functions/discordURL";
import { DiscordConfig } from '@/models/NanceTypes';
import { formatChannels, formatGuilds, formatRoles } from '../functions/discord';

const USER_COMMANDS = {
  user: "users/@me",
  guilds: "users/@me/guilds",
};

const BOT_COMMANDS = {
  channels: "guilds/{guildId}/channels",
  member: "guilds/{guildId}/members",
  roles: "guilds/{guildId}/roles",
};

function jsonFetcher(): Fetcher<any, string> {
  return async (url) => {
    const res = await fetch(url);
    const json = await res.json();
    if (json?.success === 'false') {
      throw new Error(`An error occurred while fetching the data: ${json?.error}`);
    }
    return json;
  };
}

function isBotMemberFetcher(): Fetcher<any, string> {
  return async (url) => {
    const res = await fetch(url);
    const json = await res.json();
    if (json?.success === 'false') {
      throw new Error(`An error occurred while fetching the data: ${json?.error}`);
    }
    return (json.code) ? false : true;
  };
}

export function useFetchDiscordUser(args: { address: string | undefined | null }, shouldFetch: boolean = false) {
  return useSWR<DiscordUser, string>(
    shouldFetch ? `${DISCORD_PROXY_USER_URL}?address=${args.address}&command=${USER_COMMANDS.user}` : null,
    jsonFetcher(),
  );
}

export function useLogoutDiscordUser(args: { address: string }, shouldFetch: boolean = false) {
  return useSWRMutation<DiscordUser, string>(
    shouldFetch ? `${DISCORD_PROXY_LOGOUT_URL}?address=${args.address}` : null,
    jsonFetcher(),
  );
}

export function useFetchDiscordGuilds(args: { address?: string | null }, shouldFetch: boolean = true) {
  shouldFetch = args.address ? true : false;
  return useSWR<DiscordGuild[], string>(
    shouldFetch ? `${DISCORD_PROXY_USER_URL}?address=${args.address}&command=${USER_COMMANDS.guilds}` : null,
    jsonFetcher(),
  );
}

export function useFetchDiscordChannels(args: { guildId?: string | null }, shouldFetch: boolean = true) {
  const command = BOT_COMMANDS.channels.replace("{guildId}", args?.guildId || '');
  shouldFetch = args.guildId ? true : false;
  return useSWRMutation<DiscordChannel[], string>(
    shouldFetch ? `${DISCORD_PROXY_BOT_URL}?command=${command}` : null,
    jsonFetcher(),
  );
}

export function useIsBotMemberOfGuild(args: { guildId?: string }, shouldFetch: boolean = true) {
  const command = `${BOT_COMMANDS.member.replace("{guildId}", args?.guildId || '')}/${DISCORD_CLIENT_ID}`;
  shouldFetch = args.guildId ? true : false;
  return useSWRMutation<boolean, string>(
    shouldFetch ? `${DISCORD_PROXY_BOT_URL}?command=${command}` : null,
    isBotMemberFetcher(),
  );
}

export function useFetchDiscordGuildRoles(args: { guildId?: string | null }, shouldFetch: boolean = false) {
  const command = BOT_COMMANDS.roles.replace("{guildId}", args?.guildId || '');
  shouldFetch = args.guildId ? true : false;
  return useSWRMutation<DiscordRole[], string>(
    shouldFetch ? `${DISCORD_PROXY_BOT_URL}?command=${command}` : null,
    jsonFetcher(),
  );
}

export async function useFetchDiscordInitialValues(args: { address?: string | null, discordConfig: DiscordConfig, guilds?: DiscordGuild[] }) {
  const { guildId } = args?.discordConfig;
  let guild = args?.guilds?.find(guild => guild.id === guildId);
  if (guild) guild = formatGuilds([guild])[0];

  const channelsCommand = BOT_COMMANDS.channels.replace("{guildId}", guildId);
  const channels: DiscordChannel[] = await fetch(`${DISCORD_PROXY_BOT_URL}?command=${channelsCommand}`).then(res => res.json());
  let proposalChannel = channels.find((channel) => channel.id === args?.discordConfig.channelIds.proposals);
  if (proposalChannel) proposalChannel = { ...proposalChannel, name: `# ${proposalChannel.name}` };

  let alertChannel = channels.find((channel) => channel.id === args?.discordConfig.reminder.channelIds[0]);
  if (alertChannel) alertChannel = { ...alertChannel, name: `# ${alertChannel.name}` };

  const rolesCommand = BOT_COMMANDS.roles.replace("{guildId}", guildId);
  const roles: DiscordRole[] = await fetch(`${DISCORD_PROXY_BOT_URL}?command=${rolesCommand}`).then(res => res.json());
  let role = roles.find((role) => role.id === args?.discordConfig.roles.governance);
  if (role) role = formatRoles([role])[0];

  return { guild, proposalChannel, alertChannel, role };
}