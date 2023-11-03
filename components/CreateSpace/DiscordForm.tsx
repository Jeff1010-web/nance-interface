import { ErrorMessage } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";
import { Session } from "next-auth";
import { Tooltip } from "flowbite-react";
import DiscordSelector from "./sub/DiscordSelector";

export default function DiscordForm({ session }: { session: Session }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const fieldName = "config.discord";
  return (
    <div>
      <Controller
        name={fieldName}
        control={control}
        rules={{
          required: "Can't be empty",
        }}
        render={({ field: { onChange, value } }) => (
          <DiscordSelector session={session} val={value} setVal={onChange} />
        )}
        shouldUnregister
      />
      <SmallNumberInput
        label="Temperature Check Yes vote threshold"
        name="config.discord.minYesVotes"
        register={control.register}
        defaultValue={10}
        tooltipContent="The minimum number of yes votes required for a proposal to pass Temperature Check."
        badgeContent="👍's"
      />
      <ErrorMessage
        errors={errors}
        name={fieldName}
        render={({ message }) => <p className="mt-1 text-red-500">{message}</p>}
      />
    </div>
  );
}

const SmallNumberInput = ({
  label,
  name,
  register,
  defaultValue,
  tooltipContent,
  className,
  badgeContent = "days",
}: {
  label: string;
  name: string;
  register: any;
  defaultValue: number;
  tooltipContent?: string;
  className?: string;
  badgeContent?: string;
}) => {
  return (
    <div>
      <div className="mb-2 mt-2 flex w-80">
        <label className="mt-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
        {tooltipContent && (
          <div className="ml-1 mt-1">
            <Tooltip content={tooltipContent}>
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-400 text-xs text-white">
                ?
              </span>
            </Tooltip>
          </div>
        )}
      </div>
      <div className="mt-1 flex">
        <div className="flex rounded-md border-gray-300 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-indigo-500 sm:text-sm">
          <input
            {...register(name, { shouldUnregister: true })}
            className="block h-10 w-16 rounded-md rounded-r-none border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            type="number"
            min={0}
            defaultValue={defaultValue}
          ></input>
          <span className="flex items-center rounded-l-none rounded-r-md border border-l-0 border-gray-300 bg-gray-100 px-3 text-sm text-gray-500">
            {badgeContent}
          </span>
        </div>
      </div>
    </div>
  );
};
