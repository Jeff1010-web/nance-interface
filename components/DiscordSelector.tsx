import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import { DiscordChannel, DiscordGuild } from '../models/DiscordTypes';
import { addBotUrl, guildIconBaseUrl } from '../libs/discordURL';
import { useFetchDiscordGuilds, useFetchDiscordChannels, useIsBotMemberOfGuild } from "../hooks/DiscordHooks";
import { DiscordConfig } from '../models/NanceTypes';
import GenericListbox from './GenericListbox';

const getGuildIconUrl = (guild?: DiscordGuild) => {
  if (!guild) return "/images/default_server_icon.png";
  if (!guild.icon) return "/images/default_server_icon.png";
  return `${guildIconBaseUrl}/${guild.id}/${guild.icon}.png`;
};

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DiscordSelector(
  {session, val, setVal}: {session: Session, val: DiscordConfig, setVal: (v: Partial<DiscordConfig>) => void}) {
  const router = useRouter();

  const { data: guilds, isLoading: discordGuildsLoading } = useFetchDiscordGuilds({address: session?.user?.name || ''}, router.isReady);

  const [selectedGuild, setSelectedGuild] = useState<DiscordGuild | undefined>(undefined);

  const { data: channels, trigger: discordChannelsTrigger } = useFetchDiscordChannels({guildId: selectedGuild?.id || '' }, router.isReady);

  const [selectedChannel, setSelectedChannel] = useState({ name: '-', id: null} as unknown as DiscordChannel);

  const { data: botIsMember, trigger: isBotMemberTrigger } = useIsBotMemberOfGuild({guildId: selectedGuild?.id}, (router.isReady && selectedGuild !== null));


  useEffect(() => {
    if (selectedGuild) {
      isBotMemberTrigger();
    }
    if (botIsMember) {
      discordChannelsTrigger();
      setSelectedChannel({ name: '-', id: null} as unknown as DiscordChannel);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGuild, isBotMemberTrigger, discordChannelsTrigger, botIsMember]);

  return (
    <div className="w-100">
      <GenericListbox<DiscordGuild>
        value={ selectedGuild || { icon: getGuildIconUrl() } as DiscordGuild }
        onChange={(guild) => {
          setSelectedGuild(guild);
          setVal({ ...val, guildId: guild.id });
        }}
        label="Select a Discord Server"
        items={ guilds?.map((guild) => ({ ...guild, icon: getGuildIconUrl(guild) } )) || [] }
      />

      {/* add bot to server button */}
      { selectedGuild && !botIsMember && (
        <>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                const auth = window.open(addBotUrl(selectedGuild.id), '_blank', 'width=400,height=700,noopener,noreferrer');
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
        value={ selectedChannel || { name: '-', id: null} as unknown as DiscordChannel }
        onChange={(channel) => {
          setSelectedChannel(channel);
          setVal({ ...val, guildId: channel.id });
        }}
        label="Select a channel"
        disabled={!selectedGuild || !botIsMember}
        items={ channels?.filter((channel) => channel.type === 0) || [] }
      />
    </div>
  );
}
