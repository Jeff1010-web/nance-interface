import { ErrorMessage } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";
import SnapshotSearch from "../SnapshotSearch";
import { Session } from "next-auth";

export default function SnapshotForm(
  { session } : { session: Session }
) {
  const { control, formState: { errors } } = useFormContext();
  const fieldName = 'snapshot.space';
  return (
    <div>
      <Controller
        name={fieldName}
        control={control}
        rules={{
          required: "Can't be empty",
        }}
        render={({ field: { onChange, value } }) =>
          <SnapshotSearch session={session} val={value} setVal={onChange} />
        }
        shouldUnregister
      />
      <ErrorMessage
        errors={errors}
        name={fieldName}
        render={({ message }) => <p className="text-red-500 mt-1">{message}</p>}
      />
    </div>
  );
}