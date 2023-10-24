import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { DiscordChannel, DiscordGuild, DiscordRole } from '../models/DiscordTypes';
import { addBotUrl, guildIconBaseUrl } from '../libs/discordURL';
import { useFetchDiscordGuilds, useFetchDiscordChannels, useIsBotMemberOfGuild, useFetchDiscordGuildRoles } from "../hooks/DiscordHooks";
import { DiscordConfig } from '../models/NanceTypes';
import GenericListbox from './GenericListbox';

const TEXT_CHANNEL = 0;
const MANAGE_GUILD = 1 << 5;

const getGuildIconUrl = (guild?: DiscordGuild) => {
  if (!guild) return "/images/default_server_icon.png";
  if (!guild.icon) return "/images/default_server_icon.png";
  return `${guildIconBaseUrl}/${guild.id}/${guild.icon}.png`;
};

const appendSymbol = (str: string, append: string) => {
  if (str.startsWith(append)) return str;
  return `${append}${str}`;
};

// Discord API returns a message object if there is an error,
// using the detection of the message object to determine if there is an error, could be done better
const formatGuilds = (guilds?: DiscordGuild[]): DiscordGuild[] => {
  if (!guilds || guilds.length === 0 || (guilds as any).message) return [];
  return guilds.filter((guild) => (Number(guild.permissions) & MANAGE_GUILD) === MANAGE_GUILD).map((guild) => {
    return { ...guild, icon: getGuildIconUrl(guild) };
  });
};

const formatRoles = (roles?: DiscordRole[]): DiscordRole[] => {
  if (!roles || roles.length === 0 || (roles as any).message) return [];
  return roles.map((role) => {
    return { ...role, name: appendSymbol(role.name, '@') };
  }).sort((a, b) => a.name.localeCompare(b.name)); // sort alphabetically
};

const formatChannels = (channels?: DiscordChannel[]): DiscordChannel[] => {
  if (!channels || channels.length === 0 || (channels as any).message ) return [];
  return channels.filter((channel) => channel.type === TEXT_CHANNEL).map((channel) => {
    return { ...channel, name: appendSymbol(channel.name, '# ') };
  }).sort((a, b) => a.name.localeCompare(b.name)); // sort alphabetically
};

export default function DiscordSelector(
  {session, val, setVal}: {session: Session, val: DiscordConfig, setVal: (v: Partial<DiscordConfig>) => void}) {
  const router = useRouter();

  // state
  // const [botIsMember, setBotIsMember] = useState(false);
  const [selectedGuild, setSelectedGuild] = useState<DiscordGuild | undefined>(undefined);
  const [selectedProposalChannel, setSelectedProposalChannel] = useState({ name: '-', id: null} as unknown as DiscordChannel);
  const [selectedAlertChannel, setSelectedAlertChannel] = useState({ name: '-', id: null} as unknown as DiscordChannel);
  const [selectedAlertRole, setSelectedAlertRole] = useState({ name: '-', id: null} as unknown as DiscordRole);

  // hooks
  const { data: guilds } = useFetchDiscordGuilds({address: session?.user?.name || ''}, router.isReady);
  const { data: channels, trigger: discordChannelsTrigger } = useFetchDiscordChannels({guildId: selectedGuild?.id || '' }, router.isReady);
  const { data: botIsMember, trigger: isBotMemberTrigger } = useIsBotMemberOfGuild({guildId: selectedGuild?.id}, (router.isReady && selectedGuild !== null));
  const { data: roles, trigger: discordRolesTrigger } = useFetchDiscordGuildRoles({guildId: selectedGuild?.id || '' });

  const resetRolesAndChannels = () => {
    setSelectedProposalChannel({ name: '-', id: null} as unknown as DiscordChannel);
    setSelectedAlertRole({ name: '-', id: null} as unknown as DiscordRole);
    setSelectedAlertChannel({ name: '-', id: null} as unknown as DiscordChannel);
  };

  useEffect(() => {
    if (selectedGuild) {
      isBotMemberTrigger();
    }
    if (botIsMember) {
      discordChannelsTrigger();
      discordRolesTrigger();
    }
  }, [selectedGuild, botIsMember]);

  return (
    <div className="w-100">
      <GenericListbox<DiscordGuild>
        value={ selectedGuild || { icon: getGuildIconUrl() } as DiscordGuild }
        onChange={(guild) => {
          resetRolesAndChannels();
          setSelectedGuild(guild);
          setVal({ ...val, guildId: guild.id });
        }}
        label="Select a Discord Server"
        items={ formatGuilds(guilds) }
      />

      {/* add bot to server button */}
      { selectedGuild && !botIsMember && (
        <>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                window.open(addBotUrl(selectedGuild.id), '_blank', 'width=400,height=700,noopener,noreferrer');
                if (selectedGuild && !botIsMember) {
                  const interval = setInterval(isBotMemberTrigger, 1000);
                  if (botIsMember) {
                    clearInterval(interval);
                  }
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none"
            >
            Add bot to server
            </button>
          </div>
        </>
      )}

      <GenericListbox<DiscordChannel>
        value={ selectedProposalChannel || { name: '-', id: null} as unknown as DiscordChannel }
        onChange={(channel) => {
          setSelectedProposalChannel(channel);
          setVal({ ...val, channelIds: { proposals: channel.id }});
        }}
        label="Select a channel to post proposals"
        disabled={!selectedGuild || !botIsMember || !channels}
        items={ formatChannels(channels) }
      />

      <GenericListbox<DiscordChannel>
        value={ selectedAlertChannel || { name: '-', id: null} as unknown as DiscordChannel }
        onChange={(channel) => {
          setSelectedAlertChannel(channel);
          setVal({ ...val, reminder: { channelIds: [channel.id] }});
        }}
        label="Select a channel to send daily alerts"
        disabled={!selectedGuild || !botIsMember || !channels}
        items={ formatChannels(channels) }
      />

      <GenericListbox<DiscordRole>
        value={ selectedAlertRole || { name: '-', id: null} as unknown as DiscordRole }
        onChange={(role) => {
          setSelectedAlertRole(role);
          setVal({ ...val, roles: { governance: role.id }});
        }}
        label="Select a role to alert to parcipate in your governance"
        disabled={!selectedGuild || !botIsMember || !roles}
        items={ formatRoles(roles) }
      />
    </div>
  );
}
