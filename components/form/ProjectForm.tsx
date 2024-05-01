import { ErrorMessage } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";
import ProjectSearch from "../ProjectSearch";

export default function ProjectForm({
  label,
  fieldName,
  defaultValue,
  showType = true,
  disabled = false,
  required = true,
}: {
  label?: string;
  fieldName: any;
  defaultValue?: number;
  showType?: boolean;
  disabled?: boolean;
  required?: boolean;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 flex">
        {showType && (
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
            project
          </span>
        )}
        <Controller
          name={fieldName}
          control={control}
          rules={{
            required: required && "Can't be empty",
            validate: {
              positive: (v) => !required || parseInt(v) > 0 || "Can't be negative number",
            },
          }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <ProjectSearch
              val={value}
              setVal={onChange}
              inputStyle={`${
                showType ? "rounded-none rounded-r-md" : "rounded-md"
              } h-10`}
              disabled={disabled}
            />
          )}
          defaultValue={defaultValue}
          shouldUnregister
        />
      </div>
      <ErrorMessage
        errors={errors}
        name={fieldName}
        render={({ message }) => <p className="mt-1 text-red-500">{message}</p>}
      />
    </div>
  );
}
