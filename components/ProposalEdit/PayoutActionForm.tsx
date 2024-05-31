import { useFormContext } from "react-hook-form";
import AddressForm from "../form/AddressForm";
import UIntForm from "../form/UIntForm";
import ProjectForm from "../form/ProjectForm";
import SelectForm from "../form/SelectForm";
import { dateRangesOfCycles } from "@/utils/functions/GovernanceCycle";
import { useContext } from "react";
import { SpaceContext } from "@/context/SpaceContext";
import { addDays } from "date-fns";

export default function PayoutActionForm({
  genFieldName,
  projectOwner,
}: {
  genFieldName: (field: string) => any;
  projectOwner: string;
}) {
  const { watch, getValues } = useFormContext();
  const spaceInfo = useContext(SpaceContext);

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
          showType={false}
          tooltip="Send funds to a Juicebox project or EOA?"
        />
      </div>
      <div className="col-span-4 sm:col-span-1">
        <UIntForm
          label="Duration"
          fieldName={genFieldName("count")}
          fieldType="cycles"
          tooltip="How many Juicebox funding cycles will this payout last?"
        />
        <span className="text-xs text-gray-400">
          {dateRangesOfCycles({
            cycle: spaceInfo?.currentCycle,
            length: watch(genFieldName("count")),
            currentCycle: spaceInfo?.currentCycle,
            cycleStartDate: spaceInfo?.cycleStartDate,
          })}
        </span>
      </div>
      <div className="col-span-4 sm:col-span-2">
        <UIntForm
          label="Amount"
          fieldName={genFieldName("amountUSD")}
          fieldType="$"
          tooltip="Amount in USD to be paid to the receiver each funding cycle"
        />
      </div>

      {watch(genFieldName("type")) === "project" && (
        <div className="col-span-4 sm:col-span-2">
          <ProjectForm
            label="Project Receiver"
            fieldName={genFieldName("project")}
            showType={false}
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
            showType={false}
            tooltip={`You've selected your payout to be sent to another Juicebox project. When a Juicebox project is paid, tokens are sent to the payer. The multisig of the space you are proposing to is the beneficiary of the tokens by default.`}
          />
        )}

        {watch(genFieldName("type")) !== "project" && (
          <AddressForm
            label="Receiver Address"
            fieldName={genFieldName("address")}
            showType={false}
          />
        )}
      </div>
    </div>
  );
}
