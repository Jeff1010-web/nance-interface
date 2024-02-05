import { useFieldArray } from "react-hook-form";
import GuildxyzRoleForm from "./GuildxyzRoleForm";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { SquaresPlusIcon } from "@heroicons/react/24/outline";

export const ConfigGuildxyzRolesField = "config.guildxyz.roles";

/**
 * Forms for config.guildxyz which requires a guildId
 */
export default function GuildxyzConfigForm({ guildId }: { guildId: string }) {
  const { fields, append, remove } = useFieldArray({
    name: ConfigGuildxyzRolesField,
  });

  return (
    <div className="mt-2">
      {fields.map((field: any, index) => {
        return (
          <div key={field.id} className="flex">
            <div className="w-1/2">
              <GuildxyzRoleForm
                guildId={guildId}
                label="Select a role"
                fieldName={`config.guildxyz.roles.${index}`}
              />
            </div>
            <div className="ml-2 flex items-end">
              <XMarkIcon
                className="h-8 w-8 cursor-pointer"
                onClick={() => remove(index)}
              />
            </div>
          </div>
        );
      })}

      <div
        id="add-action-button"
        className="mt-4 flex flex-col items-center justify-center rounded-lg bg-white p-8 shadow hover:cursor-pointer"
        onClick={() => append(0)}
      >
        <div className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8">
          <SquaresPlusIcon className="h-14 w-14 text-gray-400" />
          <p className="text-l mt-2 font-medium">Add a role</p>
          <p className="mt-6 text-sm text-gray-500">
            Add a role that can submit new proposal in this space.
          </p>
        </div>
      </div>
    </div>
  );
}
