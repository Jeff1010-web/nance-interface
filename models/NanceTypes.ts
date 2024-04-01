import {
  DiscordConfig,
  DiscordConfigChannels,
  DiscordConfigRoles,
  SnapshotConfig,
  JuiceboxConfig,
  GovernanceCycleForm
} from "@nance/nance-sdk";

export type CreateFormKeys =
  | "config.name"
  | "config.proposalIdPrefix"
  | `config.discord.${keyof DiscordConfig}`
  | `config.discord.channelIds.${keyof DiscordConfigChannels}`
  | `config.discord.roleIds.${keyof DiscordConfigRoles}`
  | `config.snapshot.${keyof SnapshotConfig}`
  | `config.juicebox.${keyof JuiceboxConfig}`
  | `governanceCycleForm.${keyof GovernanceCycleForm}`
  | "spaceOwners";
  