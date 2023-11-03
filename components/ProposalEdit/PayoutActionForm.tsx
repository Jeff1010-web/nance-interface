import { useFormContext } from "react-hook-form";
import AddressForm from "../form/AddressForm";
import NumberForm from "../form/NumberForm";
import ProjectForm from "../form/ProjectForm";
import SelectForm from "../form/SelectForm";

export default function PayoutActionForm({
  genFieldName,
  projectOwner,
}: {
  genFieldName: (field: string) => any;
  projectOwner: string;
}) {
  const { watch, getValues } = useFormContext();
  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-1">
        <SelectForm
          label="Receiver Type"
          fieldName={genFieldName("type")}
          options={[
            { displayValue: "Address", value: "address" },
            { displayValue: "Project", value: "project" },
          ]}
          defaultValue={
            getValues(genFieldName("project")) > 0 ? "project" : "address"
          }
        />
      </div>
      <div className="col-span-4 sm:col-span-1">
        <NumberForm
          label="Duration(Cycles)"
          fieldName={genFieldName("count")}
          decimal={1}
        />
      </div>
      <div className="col-span-4 sm:col-span-2">
        <NumberForm
          label="Amount"
          fieldName={genFieldName("amountUSD")}
          fieldType="$"
        />
      </div>

      {watch(genFieldName("type")) === "project" && (
        <div className="col-span-4 sm:col-span-2">
          <ProjectForm
            label="Project Receiver"
            fieldName={genFieldName("project")}
          />
        </div>
      )}
      <div className="col-span-4 sm:col-span-2">
        {watch(genFieldName("type")) === "project" && (
          <AddressForm
            label="Token Beneficiary"
            fieldName={genFieldName("address")}
            defaultValue={projectOwner}
            disabled
          />
        )}

        {watch(genFieldName("type")) !== "project" && (
          <AddressForm
            label="Receiver Address"
            fieldName={genFieldName("address")}
          />
        )}
      </div>
    </div>
  );
}
