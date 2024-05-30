import AddressForm from "../form/AddressForm";
import UIntForm from "../form/UIntForm";
import { useSafeBalances } from "@/utils/hooks/Safe/SafeHooks";
import GenericListbox from "../common/GenericListbox";
import { Controller, useFormContext } from "react-hook-form";
import { SafeBalanceUsdResponse } from "@/models/SafeTypes";

type ListBoxItems = {
  id?: string;
  name?: string;
};

const safeBalanceToItems = (b: SafeBalanceUsdResponse[]): ListBoxItems[] => {
  return b
    .filter((b) => !!b.tokenAddress && !!b.token)
    .map((b) => {
      return {
        id: b.tokenAddress as string,
        name: b.token?.symbol as string,
      };
    });
};

export default function TransferActionForm({
  genFieldName,
  address,
}: {
  genFieldName: (field: string) => any;
  address: string;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const { data, isLoading, error } = useSafeBalances(address, !!address);
  const items = data
    ? safeBalanceToItems(data)
    : [{ id: undefined, name: "no tokens found in Safe" }];
  console.debug("safe", data, items);

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-2">
        <AddressForm
          label="Receiver"
          fieldName={genFieldName("to")}
          showType={false}
        />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <UIntForm
          label="Amount"
          fieldName={genFieldName("amount")}
          showType={false}
        />
      </div>

      <div className="col-span-4 sm:col-span-1">
        {!isLoading && (
          <>
            <Controller
              name={genFieldName("contract")}
              control={control}
              defaultValue={items[0]?.id}
              render={({ field: { onChange, value } }) => (
                <GenericListbox<ListBoxItems>
                  value={
                    items.find((i) => i.id === value) ||
                    items[0] || {
                      id: undefined,
                      name: "no tokens found in Safe",
                    }
                  }
                  onChange={(c) => onChange(c.id)}
                  label="Token"
                  items={items}
                  disabled={items.length === 0}
                />
              )}
              shouldUnregister
            />
          </>
        )}
      </div>
    </div>
  );
}
