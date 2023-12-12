import { useFormContext } from "react-hook-form";
import AddressForm from "../form/AddressForm";
import UIntForm from "../form/UIntForm";
import ProjectForm from "../form/ProjectForm";
import SelectForm from "../form/SelectForm";
import { dateRangesOfCycles } from "@/utils/functions/GovernanceCycle";

export default function PayoutActionForm({
  genFieldName,
  projectOwner,
  currentCycle,
}: {
  genFieldName: (field: string) => any;
  projectOwner: string;
  currentCycle: number;
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
        <UIntForm
          label="Duration(Cycles)"
          fieldName={genFieldName("count")}
          decimal={1}
        />
        <span className="text-xs text-gray-900">
          {dateRangesOfCycles(
            currentCycle + 2,
            getValues(genFieldName("count")),
          )}
        </span>
      </div>
      <div className="col-span-4 sm:col-span-2">
        <UIntForm
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
