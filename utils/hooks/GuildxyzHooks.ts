import { createGuildClient } from "@guildxyz/sdk";
import useSWRImmutable from "swr/immutable";

// The only parameter is the name of your project
const GuildxyzClient = createGuildClient("Nance interface");

export type Guild = {
  id: number;
  name: string;
  urlName: string;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  imageUrl: string;
  memberCount: number;
};

export function useGuildSearch(
  search: string,
  limit: number = 10,
  offset: number = 0,
  shouldFetch: boolean = true,
) {
  return useSWRImmutable(
    shouldFetch ? ["/guildxyz/useGuildSearch", search, limit, offset] : null,
    async ([uri, _search, _limit, _offset]) => {
      const guilds = await GuildxyzClient.guild.search({
        search: _search,
        limit: _limit,
        offset: _offset,
      });
      return guilds as Guild[];
    },
  );
}

export function useGuild(guildId: number, shouldFetch: boolean = true) {
  return useSWRImmutable(
    shouldFetch ? ["/guildxyz/useGuild", guildId] : null,
    async ([uri, _guildId]) => {
      const guild = await GuildxyzClient.guild.get(_guildId);
      return guild as Guild;
    },
  );
}

export type Role = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  memberCount: number;
  visibility: "PUBLIC" | "PRIVATE" | "HIDDEN";
  position: number;
  anyOfNum: number;
  createdAt: Date;
  updatedAt: Date;
};

export function useGuildRoles(guildId: number, shouldFetch: boolean = true) {
  return useSWRImmutable(
    shouldFetch ? ["/guildxyz/useGuildRoles", guildId] : null,
    async ([uri, _guildId]) => {
      const roles = await GuildxyzClient.guild.role.getAll(_guildId);
      return roles as Role[];
    },
  );
}

export async function fetchGuild(guildId: number, address: string) {
  const results = await Promise.allSettled([
    GuildxyzClient.guild.get(guildId),
    GuildxyzClient.guild.role.getAll(guildId),
    GuildxyzClient.user.getMemberships(address as string),
  ]);

  const guild =
    results[0].status === "fulfilled" ? results[0].value : undefined;
  const rolesOfGuild =
    results[1].status === "fulfilled" ? results[1].value : [];
  const memberships = results[2].status === "fulfilled" ? results[2].value : [];

  const error = results
    .filter((r) => r.status === "rejected")
    .map((r: any) => r.reason)
    .join(", ");
  console.debug("GuildxyzHooks.fetchGuild", {
    guild,
    rolesOfGuild,
    memberships,
    error,
  });

  return {
    guild,
    rolesOfGuild,
    memberships,
    error,
  };
}

export async function accessCheckWithGuild(
  guildId: number | undefined,
  address: string | undefined,
  roles: number[],
) {
  let hasPassGuildxyzCheck = true;
  let guildxyzInfo = "";
  if (guildId && address) {
    const { guild, memberships, rolesOfGuild } = await fetchGuild(
      guildId,
      address,
    );
    const joinedGuild = memberships.find((m) => m.guildId === guildId);
    const noAccessRoleIds =
      roles.filter((r) => !(joinedGuild?.roleIds || []).includes(r)) || [];
    const noAccessRoles = noAccessRoleIds.map(
      (id) => rolesOfGuild.find((r) => r.id === id)?.name || "Unknown",
    );
    hasPassGuildxyzCheck =
      joinedGuild !== undefined && noAccessRoleIds.length < roles.length;
    const reason =
      joinedGuild === undefined
        ? `You are not a member of this guild: ${guild?.name || guildId}.`
        : noAccessRoles.length < roles.length
          ? `You do not have the required role(s):  ${noAccessRoles.join(",")}.`
          : "";
    const suggestion = `You can go to https://guild.xyz/${guild?.urlName || guildId} to join the guild and get the related roles.`;
    guildxyzInfo = reason ? reason + "\n" + suggestion : "";
  }

  return { hasPassGuildxyzCheck, guildxyzInfo };
}
