import GenericListbox from "@/components/common/GenericListbox";
import { useGuildRoles } from "@/utils/hooks/GuildxyzHooks";
import { ErrorMessage } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";

/**
 * Load all roles from the guild, list them in a dropdown and set the selected channel id into the form
 */
export default function GuildxyzRoleForm({
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
  const { data } = useGuildRoles(parseInt(guildId!), guildId !== undefined);

  const roles =
    data?.map((r) => {
      return { id: r.id.toString(), name: r.name, icon: r.imageUrl };
    }) || [];

  function roleOfId(id: number | null) {
    return (
      roles.find((c) => c.id === id?.toString()) || {
        name: "-",
        id: "-",
        icon: "",
      }
    );
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
          <GenericListbox
            value={roleOfId(value)}
            onChange={(c) => onChange(parseInt(c.id))}
            label={label}
            disabled={disabled}
            items={roles}
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
