import { ErrorMessage } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";
import GuildxyzSearch from "./sub/GuildxyzSearch";

export const ConfigGuildxyzGuildField = "config.guildxyz.id";

export default function GuildxyzForm() {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <Controller
        name={ConfigGuildxyzGuildField}
        control={control}
        rules={{
          required: "Can't be empty",
        }}
        render={({ field: { onChange, value } }) => (
          <GuildxyzSearch val={value} setVal={onChange} />
        )}
        shouldUnregister
      />
      <ErrorMessage
        errors={errors}
        name={ConfigGuildxyzGuildField}
        render={({ message }) => <p className="mt-1 text-red-500">{message}</p>}
      />
    </div>
  );
}
