import { ErrorMessage } from "@hookform/error-message";
import { useFormContext } from "react-hook-form";

export default function BooleanForm(
    { label, fieldName, checked = false } : { label: string, fieldName: any, checked?: boolean }
    ) {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                    bool
                </span>
                <input
                    type="checkbox"
                    checked={checked}
                    {...register(fieldName, { shouldUnregister: true })}
                    className="block h-10 w-10 flex-1 rounded-none rounded-r-md border-gray-300"
                  />
            </div>
            <ErrorMessage
                errors={errors}
                name={fieldName}
                render={({ message }) => <p className="text-red-500 mt-1">{message}</p>}
                />
        </div>
    )
}