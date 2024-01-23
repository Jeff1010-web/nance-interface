import { createGuildClient } from "@guildxyz/sdk";
import { useAccount } from "wagmi";
import useSWRImmutable from "swr/immutable";

// The only parameter is the name of your project
const GuildxyzClient = createGuildClient("Nance interface");

export function useGuild(guildId: number, shouldFetch = true) {
  const { address } = useAccount();

  return useSWRImmutable(
    shouldFetch ? "/guildxyz/useguild" : null,
    async (uri) => {
      const guild = await GuildxyzClient.guild.get(guildId);
      const rolesOfGuild = await GuildxyzClient.guild.role.getAll(guildId);
      const memberships = await GuildxyzClient.user.getMemberships(
        address as string,
      );
      return {
        guild,
        rolesOfGuild,
        memberships,
      };
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
      joinedGuild !== undefined && noAccessRoleIds.length === 0;
    const reason =
      joinedGuild === undefined
        ? `You are not a member of this guild: ${guild?.name || guildId}.`
        : noAccessRoles.length > 0
          ? `You do not have the required role(s):  ${noAccessRoles.join(",")}.`
          : "";
    const suggestion = `You can go to https://guild.xyz/${guild?.urlName || guildId} to join the guild and get the related roles.`;
    guildxyzInfo = reason ? reason + "\n" + suggestion : "";
  }

  return { hasPassGuildxyzCheck, guildxyzInfo };
}
