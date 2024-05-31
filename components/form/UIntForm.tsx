import { ErrorMessage } from "@hookform/error-message";
import { useFormContext } from "react-hook-form";
import { classNames } from "@/utils/functions/tailwind";
import TooltipInfo from "./TooltipInfo";

/**
 * UIntForm is a form component for uint input with a button to add decimal zeros.
 */
export default function UIntForm({
  label,
  fieldName,
  fieldType = "uint256",
  defaultValue = 0,
  showType = true,
  tooltip = ""
}: {
  label: string;
  fieldName: any;
  fieldType?: string;
  defaultValue?: number;
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

        <input
          type="number"
          step={1}
          min={0}
          defaultValue={defaultValue}
          {...register(fieldName, {
            shouldUnregister: true,
            required: "Can't be empty",
          })}
          className={classNames(
            "block h-10 w-full flex-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
            showType ? "rounded-none rounded-r-md" : "rounded-md",
          )}
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
