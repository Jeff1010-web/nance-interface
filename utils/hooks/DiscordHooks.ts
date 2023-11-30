import useSWR, { Fetcher } from "swr";
import useSWRMutation from "swr/mutation";
import {
  DiscordGuild,
  DiscordUser,
  DiscordChannel,
  DiscordRole,
} from "../../models/DiscordTypes";
import { BOT_COMMANDS, USER_COMMANDS } from "@/constants/Discord";
import {
  DISCORD_PROXY_USER_URL,
  DISCORD_PROXY_BOT_URL,
  DISCORD_PROXY_LOGOUT_URL,
  DISCORD_CLIENT_ID,
} from "../functions/discordURL";

function jsonFetcher(): Fetcher<any, string> {
  return async (url) => {
    const res = await fetch(url);
    const json = await res.json();
    if (json?.success === "false") {
      throw new Error(
        `An error occurred while fetching the data: ${json?.error}`,
      );
    }
    return json;
  };
}

function isBotMemberFetcher(): Fetcher<any, string> {
  return async (url) => {
    const res = await fetch(url);
    const json = await res.json();
    if (json?.success === "false") {
      throw new Error(
        `An error occurred while fetching the data: ${json?.error}`,
      );
    }
    return json.code ? false : true;
  };
}

export function useFetchDiscordUser(
  args: { address: string | undefined | null },
  shouldFetch: boolean = false,
) {
  return useSWR<DiscordUser, string>(
    shouldFetch
      ? `${DISCORD_PROXY_USER_URL}?address=${args.address}&command=${USER_COMMANDS.user}`
      : null,
    jsonFetcher(),
  );
}

export function useLogoutDiscordUser(
  args: { address: string },
  shouldFetch: boolean = false,
) {
  return useSWRMutation<DiscordUser, string>(
    shouldFetch ? `${DISCORD_PROXY_LOGOUT_URL}?address=${args.address}` : null,
    jsonFetcher(),
  );
}

export function useFetchDiscordGuilds(
  address: string | undefined,
  shouldFetch: boolean = true,
) {
  return useSWR<DiscordGuild[], string>(
    shouldFetch && address
      ? `${DISCORD_PROXY_USER_URL}?address=${address}&command=${USER_COMMANDS.guilds}`
      : null,
    jsonFetcher(),
  );
}

// FIXME: useSWRMutation is meant for POST/PUT/DELETE requests, not GET

export function useFetchDiscordChannels(
  guildId: string | undefined,
  shouldFetch: boolean = true,
) {
  const command = BOT_COMMANDS.channels.replace("{guildId}", guildId || "");
  return useSWR<DiscordChannel[], string>(
    shouldFetch && guildId
      ? `${DISCORD_PROXY_BOT_URL}?command=${command}`
      : null,
    jsonFetcher(),
  );
}

export function useIsBotMemberOfGuild(
  guildId: string | undefined,
  shouldFetch: boolean = true,
) {
  const command = `${BOT_COMMANDS.member.replace(
    "{guildId}",
    guildId || "",
  )}/${DISCORD_CLIENT_ID}`;
  return useSWR<boolean, string>(
    shouldFetch && guildId
      ? `${DISCORD_PROXY_BOT_URL}?command=${command}`
      : null,
    isBotMemberFetcher(),
  );
}

export function useDiscordGuildRoles(
  guildId: string | undefined,
  shouldFetch: boolean = true,
) {
  const command = BOT_COMMANDS.roles.replace("{guildId}", guildId || "");
  return useSWR<DiscordRole[], string>(
    shouldFetch && guildId
      ? `${DISCORD_PROXY_BOT_URL}?command=${command}`
      : null,
    jsonFetcher(),
  );
}
