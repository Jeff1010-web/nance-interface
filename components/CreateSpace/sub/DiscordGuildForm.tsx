import GenericListbox from "@/components/common/GenericListbox";
import { DiscordGuild } from "@/models/DiscordTypes";
import { managedGuildsOf } from "@/utils/functions/discord";
import { useFetchDiscordGuilds } from "@/utils/hooks/DiscordHooks";
import { ErrorMessage } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";

/**
 * Load all managed guild, list them in a dropdown and set the selected guild id into the form
 */
export default function DiscordGuildForm({
  address,
  label,
  fieldName,
  disabled = false,
}: {
  address: string | undefined;
  label: string;
  fieldName: string;
  disabled?: boolean;
}) {
  const { control, formState: { errors } } = useFormContext();
  const { data } = useFetchDiscordGuilds(address, !disabled);

  const guilds = managedGuildsOf(data);

  function guildOfId(id: string) {
    const guild =
      guilds.find((g) => g.id === id) ||
      ({ name: '-', id } as unknown as DiscordGuild);
    return guild;
  }

  return (
    <>
      <Controller
        name={fieldName}
        control={control}
        rules={{
          required: "Can't be empty",
        }}
        render={({ field: { onChange, value } }) => (
          <GenericListbox<DiscordGuild>
            value={guildOfId(value)}
            onChange={(c) => onChange(c.id)}
            label={label}
            disabled={disabled}
            items={guilds}
          />
        )}
        shouldUnregister
      />
      <ErrorMessage
        errors={errors}
        name={fieldName}
        render={({ message }) => <p className="text-red-500">{message}</p>}
      />
    </>
  );
}
