import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Session } from "next-auth";
import { DiscordChannel, DiscordGuild, DiscordRole } from "@/models/DiscordTypes";
import { addBotUrl, getGuildIconUrl } from "@/utils/functions/discordURL";
import { formatGuilds, formatChannels, formatRoles } from '@/utils/functions/discord';
import {
  useFetchDiscordGuilds,
  useFetchDiscordChannels,
  useIsBotMemberOfGuild,
  useFetchDiscordGuildRoles,
  useFetchDiscordInitialValues,
} from "@/utils/hooks/DiscordHooks";
import { DiscordConfig } from "@/models/NanceTypes";
import GenericListbox from "@/components/common/GenericListbox";

export default function DiscordSelector({
  session,
  val,
  setVal,
  discordConfig,
}: {
  session: Session;
  val: DiscordConfig;
  setVal: (v: Partial<DiscordConfig>) => void;
  discordConfig?: DiscordConfig;
}) {
  const router = useRouter();

  // state
  const [selectedGuild, setSelectedGuild] = useState<DiscordGuild | undefined>();
  const [selectedProposalChannel, setSelectedProposalChannel] = useState<DiscordChannel | undefined>()
  const [selectedAlertChannel, setSelectedAlertChannel] = useState<DiscordChannel | undefined>();
  const [selectedAlertRole, setSelectedAlertRole] = useState<DiscordRole | undefined>()
  const [configLoaded, setConfigLoaded] = useState<boolean>(false);

  // hooks
  const { data: guilds } = useFetchDiscordGuilds({ address: session.user?.name });
  const { data: channels, trigger: channelsTrigger } = useFetchDiscordChannels({ guildId: selectedGuild?.id });
  const { data: botIsMember, trigger: memberTrigger } = useIsBotMemberOfGuild({ guildId: selectedGuild?.id }, router.isReady);
  const { data: roles, trigger: rolesTrigger } = useFetchDiscordGuildRoles({ guildId: selectedGuild?.id });

  const resetRolesAndChannels = () => {
    setSelectedProposalChannel(undefined);
    setSelectedAlertRole(undefined);
    setSelectedAlertChannel(undefined);
  };

  useEffect(() => {
    if (selectedGuild && !botIsMember) {
      memberTrigger();
    }
    if (botIsMember) {
      channelsTrigger();
      rolesTrigger();
    }
    async function fullInitialValues() {
      if (discordConfig && guilds && !configLoaded) {
        const { guild, proposalChannel, alertChannel, role } = await useFetchDiscordInitialValues({ address: session.user?.name, discordConfig, guilds });
        setConfigLoaded(true);
        setSelectedGuild(guild);
        setSelectedProposalChannel(proposalChannel);
        setSelectedAlertChannel(alertChannel);
        setSelectedAlertRole(role);
      }
    }
    fullInitialValues();
  }, [selectedGuild, botIsMember, guilds]);

  return (
    <div className="w-100">
      <GenericListbox<DiscordGuild>
        value={selectedGuild || ({ icon: getGuildIconUrl() } as DiscordGuild)}
        onChange={(guild) => {
          resetRolesAndChannels();
          setSelectedGuild(guild);
          setVal({ ...val, guildId: guild.id });
        }}
        label="Select a Discord Server"
        disabled={!guilds || !!discordConfig}
        items={formatGuilds(guilds)}
      />

      {/* add bot to server button */}
      {selectedGuild && !botIsMember && (
        <>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                window.open(addBotUrl(selectedGuild.id), "_blank", "width=400,height=700,noopener,noreferrer");
                if (selectedGuild && !botIsMember) {
                  const interval = setInterval(memberTrigger, 1000);
                  if (botIsMember) {
                    clearInterval(interval);
                  }
                }
              }}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium leading-5 text-white hover:bg-indigo-500 focus:outline-none"
            >
              Add bot to server
            </button>
          </div>
        </>
      )}

      <GenericListbox<DiscordChannel>
        value={
          selectedProposalChannel ||
          ({ name: "-", id: null } as unknown as DiscordChannel)
        }
        onChange={(channel) => {
          setSelectedProposalChannel(channel);
          setVal({ ...val, channelIds: { proposals: channel.id } });
        }}
        label="Select a channel to post proposals"
        disabled={!selectedGuild || !botIsMember || !channels || !!discordConfig}
        items={formatChannels(channels)}
      />

      <GenericListbox<DiscordChannel>
        value={
          selectedAlertChannel ||
          ({ name: "-", id: null } as unknown as DiscordChannel)
        }
        onChange={(channel) => {
          setSelectedAlertChannel(channel);
          setVal({ ...val, reminder: { channelIds: [channel.id] } });
        }}
        label="Select a channel to send daily alerts"
        disabled={!selectedGuild || !botIsMember || !channels || !!discordConfig}
        items={formatChannels(channels)}
      />

      <GenericListbox<DiscordRole>
        value={
          selectedAlertRole ||
          ({ name: "-", id: null } as unknown as DiscordRole)
        }
        onChange={(role) => {
          setSelectedAlertRole(role);
          setVal({ ...val, roles: { governance: role.id } });
        }}
        label="Select a role to alert to participate in your governance"
        disabled={!selectedGuild || !botIsMember || !roles || !!discordConfig}
        items={formatRoles(roles)}
      />
    </div>
  );
}
