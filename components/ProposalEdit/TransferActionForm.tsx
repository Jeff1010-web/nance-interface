import AddressForm from "../form/AddressForm";
import UIntForm from "../form/UIntForm";
import { useSafeBalances } from "@/utils/hooks/Safe/SafeHooks";
import GenericListbox from "../common/GenericListbox";
import { Controller, useFormContext } from "react-hook-form";
import { SafeBalanceUsdResponse } from "@/models/SafeTypes";

type ListBoxItems = {
  id: string;
  name: string;
};

const safeBalanceToItems = (b: SafeBalanceUsdResponse[]): ListBoxItems[] => {
  return b.map((b) => {
    return {
      id: b.tokenAddress || "",
      name: b.token?.symbol || "",
    };
  });
};

export default function TransferActionForm({
  genFieldName, address
}: {
  genFieldName: (field: string) => any; address: string;
}) {

  const {
    control,
    formState: { errors },
  } = useFormContext();
  console.log(address);
  const { data, isLoading, error } = useSafeBalances(address, !!address);
  const items = data ? safeBalanceToItems(data) : [{ id: "-", name: "-" }];
  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-2">
        <AddressForm label="Receiver" fieldName={genFieldName("to")} />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <UIntForm label="Amount" fieldName={genFieldName("amount")} />
      </div>

      <div className="col-span-4 sm:col-span-1">
        {!isLoading && (
          <Controller
            name={genFieldName("contract")}
            control={control}
            render={({ field: { onChange, value } }) => (
              <GenericListbox<ListBoxItems>
                value={items.find((i) => i.id === value) || { id: "-", name: "-" }}
                onChange={(c) => onChange(c.id)}
                label="Token"
                items={items}
              />
            )}
            shouldUnregister
          />
        )}
      </div>
    </div>
  );
}
