import GenericListbox from "@/components/common/GenericListbox";
import { DiscordChannel } from "@/models/DiscordTypes";
import { formatChannels } from "@/utils/functions/discord";
import { useFetchDiscordChannels } from "@/utils/hooks/DiscordHooks";
import { ErrorMessage } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";

/**
 * Load all channels from the guild, list them in a dropdown and set the selected channel id into the form
 */
export default function DiscordChannelForm({
  guildId,
  label,
  fieldName,
  disabled = false,
}: {
  guildId: string | undefined;
  label: string;
  fieldName: string;
  disabled?: boolean;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { data } = useFetchDiscordChannels(guildId);

  const channels = formatChannels(data);

  function channelOfId(id: string) {
    const channel =
      channels.find((c) => c.id === id) ||
      ({ name: "-", id } as unknown as DiscordChannel);
    return channel;
  }

  return (
    <div className="mt-2">
      <Controller
        name={fieldName}
        control={control}
        rules={{
          required: "Can't be empty",
        }}
        render={({ field: { onChange, value } }) => (
          <GenericListbox<DiscordChannel>
            value={channelOfId(value)}
            onChange={(c) => onChange(c.id)}
            label={label}
            disabled={disabled}
            items={channels}
          />
        )}
        shouldUnregister
      />
      <ErrorMessage
        errors={errors}
        name={fieldName}
        render={({ message }) => <p className="text-red-500">{message}</p>}
      />
    </div>
  );
}
