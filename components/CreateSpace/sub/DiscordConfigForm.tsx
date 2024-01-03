import { addBotUrl } from "@/utils/functions/discordURL";
import { useIsBotMemberOfGuild } from "@/utils/hooks/DiscordHooks";
import DiscordChannelForm from "./DiscordChannelForm";
import DiscordRoleForm from "./DiscordRoleForm";

/**
 * Forms for config.discord which requires a guildId
 */
export default function DiscordConfigForm({ guildId }: { guildId: string }) {
  const { data: botIsMember, mutate } = useIsBotMemberOfGuild(guildId);

  if (!botIsMember) {
    return (
      <div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              window.open(
                addBotUrl(guildId),
                "_blank",
                "width=400,height=700,noopener,noreferrer",
              );
              if (!botIsMember) {
                const interval = setInterval(mutate, 1000);
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
      </div>
    );
  }

  return (
    <div className="mt-2">
      <DiscordChannelForm
        guildId={guildId}
        label="Select a channel to post proposals"
        fieldName="config.discord.channelIds.proposals"
      />

      <DiscordChannelForm
        guildId={guildId}
        label="Select a channel to send daily alerts"
        fieldName="config.discord.reminder.channelIds.[0]"
      />

      <DiscordRoleForm
        guildId={guildId}
        label="Select a role to alert to participate in your governance"
        fieldName="config.discord.roles.governance"
      />
    </div>
  );
}
