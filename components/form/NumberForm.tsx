import { ErrorMessage } from "@hookform/error-message";
import { useFormContext } from "react-hook-form";
import GenericButton from "../GenericButton";

export default function NumberForm(
    { label, fieldName, fieldType = "uint256", decimal = 18, defaultValue = 0 } : { label: string, fieldName: any, fieldType?: string, decimal?: number, defaultValue?: number }
    ) {
    const { register, setValue, getValues, formState: { errors } } = useFormContext();

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                    {fieldType}
                </span>
                <input
                    type="number"
                    step={1}
                    min={0}
                    defaultValue={defaultValue}
                    {...register(fieldName, { shouldUnregister: true, required: "Can't be empty" })}
                    className="block h-10 w-full flex-1 rounded-none border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <GenericButton
                    onClick={() => setValue(fieldName, getValues<string>(fieldName)
                    .concat("0".repeat(decimal)))}
                    className="inline-flex items-center rounded-none rounded-r-md border border-l-0 border-gray-300 m-0">
                    {decimal}
                </GenericButton>
            </div>
            <ErrorMessage
                errors={errors}
                name={fieldName}
                render={({ message }) => <p className="text-red-500 mt-1">{message}</p>}
                />
        </div>
    )
}