import { addBotUrl } from "@/utils/functions/discordURL";
import { useIsBotMemberOfGuild } from "@/utils/hooks/DiscordHooks";
import DiscordChannelForm from "./DiscordChannelForm";
import DiscordRoleForm from "./DiscordRoleForm";

/**
 * Forms for config.discord which requires a guildId
 */
export default function DiscordConfigForm({
  guildId,
  disabled = false,
}: {
  guildId: string;
  disabled?: boolean;
}) {
  const { data: botIsMember, mutate } = useIsBotMemberOfGuild(guildId);

  if (!botIsMember) {
    return (
      <div>
        <div className="mt-4">
          <button
            type="button"
            disabled={!guildId}
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
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium leading-5 text-white hover:bg-indigo-500 focus:outline-none disabled:bg-gray-500"
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
        disabled={disabled}
      />

      <DiscordChannelForm
        guildId={guildId}
        label="Select a channel to send daily alerts"
        fieldName="config.discord.reminder.channelIds.[0]"
        disabled={disabled}
      />

      <DiscordRoleForm
        guildId={guildId}
        label="Select a role to alert to participate in your governance"
        fieldName="config.discord.roles.governance"
        disabled={disabled}
      />
    </div>
  );
}
