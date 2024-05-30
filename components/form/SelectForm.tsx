import { classNames } from "@/utils/functions/tailwind";
import { ErrorMessage } from "@hookform/error-message";
import { useFormContext } from "react-hook-form";
import TooltipInfo from "./TooltipInfo";

export interface SelectOption {
  displayValue: string;
  value: string;
}

export default function SelectForm({
  label,
  fieldName,
  options,
  fieldType = "string",
  defaultValue = "",
  showType = true,
  tooltip = "",
}: {
  label: string;
  fieldName: any;
  options: SelectOption[];
  fieldType?: string;
  defaultValue?: string;
  showType?: boolean;
  tooltip?: string;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <div className="text-sm font-medium text-gray-700 flex space-x-1 items-center">
        <span>{label}</span> {tooltip && <TooltipInfo content={tooltip} />}
      </div>
      <div className="mt-1 flex rounded-md shadow-sm">
        {showType && (
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
            {fieldType}
          </span>
        )}

        <select
          {...register(fieldName, {
            shouldUnregister: true,
            value: defaultValue,
          })}
          className={classNames(
            "block w-full border border-gray-300 bg-white h-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm",
            showType ? "rounded-none rounded-r-md" : "rounded-md",
          )}
        >
          {options.map((o, i) => (
            <option key={i} value={o.value}>
              {o.displayValue}
            </option>
          ))}
        </select>
      </div>
      <ErrorMessage
        errors={errors}
        name={fieldName}
        render={({ message }) => <p className="text-red-500 mt-1">{message}</p>}
      />
    </div>
  );
}
