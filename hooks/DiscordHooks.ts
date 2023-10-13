import useSWR, { Fetcher } from 'swr';
import useSWRMutation from 'swr/mutation';
import { DiscordGuild, DiscordUser, DiscordChannel, DiscordRole } from '../models/DiscordTypes';
import { DISCORD_PROXY_USER_URL, DISCORD_PROXY_BOT_URL, DISCORD_PROXY_LOGOUT_URL, DISCORD_CLIENT_ID } from "../libs/discordURL";

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

export function useFetchDiscordGuilds(args: { address: string }, shouldFetch: boolean = true) {
  shouldFetch = args.address ? true : false;
  return useSWR<DiscordGuild[], string>(
    shouldFetch ? `${DISCORD_PROXY_USER_URL}?address=${args.address}&command=${USER_COMMANDS.guilds}` : null,
    jsonFetcher(),
  );
}

export function useFetchDiscordChannels(args: { guildId: string }, shouldFetch: boolean = true) {
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

export function useFetchDiscordGuildRoles(args: { guildId: string }, shouldFetch: boolean = false) {
  const command = BOT_COMMANDS.roles.replace("{guildId}", args?.guildId || '');
  shouldFetch = args.guildId ? true : false;
  return useSWRMutation<DiscordRole[], string>(
    shouldFetch ? `${DISCORD_PROXY_BOT_URL}?command=${command}` : null,
    jsonFetcher(),
  );
}