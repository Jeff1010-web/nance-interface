import { useFormContext } from "react-hook-form";
import DiscordGuildForm from "./sub/DiscordGuildForm";
import { useSession } from "next-auth/react";
import NumberForm from "../form/NumberForm";
import DiscordConfigForm from "./sub/DiscordConfigForm";

export default function DiscordForm({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const { watch } = useFormContext();
  const { data: session } = useSession();

  return (
    <div className="mt-2 w-fit">
      <DiscordGuildForm
        address={session?.user?.name || ""}
        fieldName="config.discord.guildId"
        label="Select a Discord Server"
        disabled={disabled}
      />

      <DiscordConfigForm
        guildId={watch("config.discord.guildId")}
        disabled={disabled}
      />

      <NumberForm
        label="Temperature Check Yes vote threshold"
        fieldName="config.discord.poll.minYesVotes"
        defaultValue={10}
        tooltipContent="The minimum number of yes votes required for a proposal to pass Temperature Check."
        badgeContent="👍's"
        defaultStep={1}
        disabled={disabled}
      />
    </div>
  );
}
