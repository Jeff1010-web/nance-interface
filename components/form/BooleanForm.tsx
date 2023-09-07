import { ErrorMessage } from "@hookform/error-message";
import { useFormContext } from "react-hook-form";

export default function BooleanForm(
  { label, fieldName, checked = false, showType = true } : { label: string, fieldName: any, checked?: boolean, showType?: boolean }
) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        { showType && (
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                        bool
          </span>
        )}
        <input
          type="checkbox"
          defaultChecked={checked}
          {...register(fieldName, { shouldUnregister: true })}
          className={`block h-10 w-10 flex-1 rounded-r-md border-gray-300 ${showType ? 'rounded-r-none' : 'rounded-l-md'}`}
        />
      </div>
      <ErrorMessage
        errors={errors}
        name={fieldName}
        render={({ message }) => <p className="text-red-500 mt-1">{message}</p>}
      />
    </div>
  );
}