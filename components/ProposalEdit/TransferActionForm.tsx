import { CONTRACT_MAP } from "@/constants/Contract";
import AddressForm from "../form/AddressForm";
import NumberForm from "../form/NumberForm";
import SelectForm from "../form/SelectForm";

export default function TransferActionForm({
  genFieldName,
}: {
  genFieldName: (field: string) => any;
}) {
  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-2">
        <AddressForm label="Receiver" fieldName={genFieldName("to")} />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <NumberForm label="Amount" fieldName={genFieldName("amount")} />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <SelectForm
          label="Token"
          fieldName={genFieldName("contract")}
          options={[
            { displayValue: "ETH", value: CONTRACT_MAP.ETH },
            { displayValue: "USDC", value: CONTRACT_MAP.USDC },
            { displayValue: "JBX", value: CONTRACT_MAP.JBX },
          ]}
          defaultValue={CONTRACT_MAP.ETH}
        />
      </div>
    </div>
  );
}
