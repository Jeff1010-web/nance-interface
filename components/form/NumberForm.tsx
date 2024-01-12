import { Tooltip } from "flowbite-react";
import { ErrorMessage } from "@hookform/error-message";
import { useFormContext } from "react-hook-form";

export default function NumberForm({
  label,
  fieldName,
  defaultValue,
  tooltipContent,
  badgeContent = "days",
  disabled = false,
  defaultStep = 1e-18,
}: {
  label: string;
  fieldName: string;
  defaultValue: number;
  tooltipContent?: string;
  badgeContent?: string;
  disabled?: boolean;
  defaultStep?: number;
}) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

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
          {disabled && (
            <input
              value={watch(fieldName)}
              className="block h-10 w-16 rounded-md rounded-r-none border-gray-300 disabled:bg-gray-100 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              type="number"
              step={defaultStep}
              min={0}
              defaultValue={defaultValue}
              disabled
            ></input>
          )}

          {!disabled && (
            <input
              {...register(fieldName, {
                shouldUnregister: true,
              })}
              className="block h-10 w-16 rounded-md rounded-r-none border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              type="number"
              step={defaultStep}
              min={0}
              defaultValue={defaultValue}
            ></input>
          )}

          <span className="flex items-center rounded-l-none rounded-r-md border border-l-0 border-gray-300 bg-gray-100 px-3 text-sm text-gray-500">
            {badgeContent}
          </span>
        </div>
      </div>

      <ErrorMessage
        errors={errors}
        name={fieldName}
        render={({ message }) => <p className="mt-1 text-red-500">{message}</p>}
      />
    </div>
  );
}
