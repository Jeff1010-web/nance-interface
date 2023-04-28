import { ErrorMessage } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";
import ENSAddressInput from "../ENSAddressInput";

export default function AddressForm(
    { label, fieldName, defaultValue = "" } : { label: string, fieldName: any, defaultValue?: string }
    ) {
    const { control, formState: { errors } } = useFormContext();

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                    address
                </span>
                <Controller
                    name={fieldName}
                    control={control}
                    rules={{
                        required: "Can't be empty",
                        pattern: { value: /^0x[a-fA-F0-9]{40}$/, message: "Not a valid address" }
                    }}
                    render={({ field: { onChange, onBlur, value, ref } }) =>
                        <ENSAddressInput val={value} setVal={onChange} inputStyle="rounded-none h-10 rounded-r-md" />
                    }
                    defaultValue={defaultValue}
                    shouldUnregister
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