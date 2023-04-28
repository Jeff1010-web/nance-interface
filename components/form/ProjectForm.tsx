import { ErrorMessage } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";
import ProjectSearch from "../juicebox/ProjectSearch";

export default function ProjectForm(
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
                    project
                </span>
                <Controller
                    name={fieldName}
                    control={control}
                    rules={{
                        required: "Can't be empty",
                        validate: {
                            positive: (v) => parseInt(v) > -1 || "Can't be negative number"
                        }
                    }}
                    render={({ field: { onChange, onBlur, value, ref } }) =>
                        <ProjectSearch val={value} setVal={onChange} inputStyle="rounded-none h-10 rounded-r-md" />
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