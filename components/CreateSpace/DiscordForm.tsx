import { useFormContext } from "react-hook-form";
import DiscordGuildForm from "./sub/DiscordGuildForm";
import { useSession } from "next-auth/react";
import NumberForm from "../form/NumberForm";
import DiscordConfigForm from "./sub/DiscordConfigForm";

export default function DiscordForm() {
  const { watch } = useFormContext();
  const { data: session } = useSession();

  return (
    <div className="w-fit">
      <DiscordGuildForm
        address={session?.user?.name || ""}
        fieldName="config.discord.guildId"
        label="Select a Discord Server"
      />

      <DiscordConfigForm guildId={watch("config.discord.guildId")} />

      <NumberForm
        label="Temperature Check Yes vote threshold"
        fieldName="config.discord.poll.minYesVotes"
        defaultValue={10}
        tooltipContent="The minimum number of yes votes required for a proposal to pass Temperature Check."
        badgeContent="👍's"
      />
    </div>
  );
}
