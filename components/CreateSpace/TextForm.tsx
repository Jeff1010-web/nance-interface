import { Tooltip } from "flowbite-react";
import { ErrorMessage } from "@hookform/error-message";
import { useFormContext } from "react-hook-form";

type TextInputProps = {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  maxLength?: number;
  className?: string;
  tooltip?: string;
  placeHolder?: string;
  disabled?: boolean;
};

export default function TextForm({
  label,
  name,
  required = true,
  type = "text",
  maxLength,
  className,
  tooltip,
  placeHolder,
  disabled,
}: TextInputProps) {
  const {
    formState: { errors },
    register
  } = useFormContext();

  return (
    <div className="mb-2 mt-2 flex w-fit flex-col">
      <label
        htmlFor={name}
        className="relative flex text-sm font-medium text-gray-700"
      >
        {label}
        {tooltip && (
          <div className="ml-1">
            <Tooltip content={tooltip}>
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-400 text-xs text-white">
                ?
              </span>
            </Tooltip>
          </div>
        )}
      </label>
      <input
        type={type}
        maxLength={maxLength}
        placeholder={placeHolder}
        autoComplete="off"
        disabled={disabled}
        className={`${className} mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 sm:text-sm `}
        {...register(name, { required: required && "Can't be empty", shouldUnregister: true })}
      />
      <ErrorMessage
        errors={errors}
        name={name}
        render={({ message }) => <p className="mt-1 text-red-500">{message}</p>}
      />
    </div>
  );
}
