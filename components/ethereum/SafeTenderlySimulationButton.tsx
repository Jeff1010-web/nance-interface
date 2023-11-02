import TenderlySimulationButton from "./TenderlySimulationButton";
import { GenericTransactionData } from "./TransactionCreator";
import { useCreateTransaction } from "../../utils/hooks/SafeHooks";
import { TenderlySimulateArgs } from "../../utils/hooks/TenderlyHooks";
import { useEffect, useState } from "react";

export default function SafeTenderlySimulationButton({ address, transactions }: { address: string, transactions: GenericTransactionData[] }) {
  const [shouldSimulate, setShouldSimulate] = useState<boolean>(false);

  const { value: safeTransaction } = useCreateTransaction(address, transactions);

  const simulationArgs: TenderlySimulateArgs = {
    from: address,
    to: safeTransaction?.data.to || "",
    value: parseInt(safeTransaction?.data.value || "0"),
    input: safeTransaction?.data.data || ""
  };

  useEffect(() => {
    if (shouldSimulate) {
      setShouldSimulate(false);
    }
  }, [transactions]);

  return (
    <div className="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
      <TenderlySimulationButton simulationArgs={simulationArgs} shouldSimulate={shouldSimulate} setShouldSimulate={setShouldSimulate} />
    </div>
  )
}
