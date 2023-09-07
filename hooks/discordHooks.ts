import useSWR, { Fetcher } from 'swr';
import useSWRMutation from 'swr/mutation';
import { DiscordGuild, DiscordUser, DiscordChannel } from '../models/DiscordTypes';
import { DISCORD_PROXY_USER_URL, DISCORD_PROXY_BOT_URL, DISCORD_PROXY_LOGOUT_URL, DISCORD_CLIENT_ID } from "../libs/discordURL";

const USER_COMMANDS = {
  user: "users/@me",
  guilds: "users/@me/guilds",
};

const BOT_COMMANDS = {
  channels: "guilds/{guildId}/channels",
  member: "guilds/{guildId}/members",
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

function guildsFetcher(): Fetcher<any, string> {
  const MANAGE_GUILD = 1 << 5;
  return async (url) => {
    const res = await fetch(url);
    const json = await res.json();
    if (json?.success === 'false') {
      throw new Error(`An error occurred while fetching the data: ${json?.error}`);
    }
    return json.filter((guild: DiscordGuild) => {
      return (Number(guild.permissions) & MANAGE_GUILD) === MANAGE_GUILD;
    });
  };
}

function textChannelsFetcher(): Fetcher<any, string> {
  return async (url) => {
    const res = await fetch(url);
    const json = await res.json();
    if (json?.success === 'false') {
      throw new Error(`An error occurred while fetching the data: ${json?.error}`);
    }
    if (json.code) return [];
    return json.filter((channel: DiscordChannel) => {
      return channel.type === 0;
    });
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

export function useFetchDiscordUser(args: { address: string }, shouldFetch: boolean = true) {
  shouldFetch = args.address ? true : false;
  return useSWR<DiscordUser, string>(
    shouldFetch ? `${DISCORD_PROXY_USER_URL}?address=${args.address}&command=${USER_COMMANDS.user}` : null,
    jsonFetcher(),
  );
}

export function useLogoutDiscordUser(args: { address: string }, shouldFetch: boolean = true) {
  shouldFetch = args.address ? true : false;
  return useSWRMutation<DiscordUser, string>(
    shouldFetch ? `${DISCORD_PROXY_LOGOUT_URL}?address=${args.address}` : null,
    jsonFetcher(),
  );
}

export function useFetchDiscordGuilds(args: { address: string }, shouldFetch: boolean = true) {
  shouldFetch = args.address ? true : false;
  return useSWR<DiscordGuild[], string>(
    shouldFetch ? `${DISCORD_PROXY_USER_URL}?address=${args.address}&command=${USER_COMMANDS.guilds}` : null,
    guildsFetcher(),
  );
}

export function useFetchDiscordChannels(args: { guildId: string }, shouldFetch: boolean = true) {
  const command = BOT_COMMANDS.channels.replace("{guildId}", args?.guildId || '');
  shouldFetch = args.guildId ? true : false;
  return useSWRMutation<DiscordChannel[], string>(
    shouldFetch ? `${DISCORD_PROXY_BOT_URL}?command=${command}` : null,
    textChannelsFetcher(),
  );
}

export function useIsBotMemberOfGuild(args: {guildId?: string }, shouldFetch: boolean = true) {
  const command = `${BOT_COMMANDS.member.replace("{guildId}", args?.guildId || '')}/${DISCORD_CLIENT_ID}`;
  shouldFetch = args.guildId ? true : false;
  return useSWRMutation<boolean, string>(
    shouldFetch ? `${DISCORD_PROXY_BOT_URL}?command=${command}` : null,
    isBotMemberFetcher(),
  );
}