import { ErrorMessage } from "@hookform/error-message";
import { useFormContext } from "react-hook-form";
import GenericButton from "../common/GenericButton";
import { classNames } from "@/utils/functions/tailwind";

/**
 * UIntForm is a form component for uint input with a button to add decimal zeros.
 */
export default function UIntForm({
  label,
  fieldName,
  fieldType = "uint256",
  decimal = 18,
  defaultValue = 0,
  showType = true,
}: {
  label: string;
  fieldName: any;
  fieldType?: string;
  decimal?: number;
  defaultValue?: number;
  showType?: boolean;
}) {
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
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
