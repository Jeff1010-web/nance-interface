import TenderlySimulationButton from "./TenderlySimulationButton";
import { useCreateTransaction } from "@/utils/hooks/Safe/SafeHooks";
import { TenderlySimulateArgs } from "@/utils/hooks/TenderlyHooks";
import { useContext, useEffect, useState } from "react";
import { GenericTransactionData } from "../Transaction/TransactionCreator";
import { NetworkContext } from "@/context/NetworkContext";
import { getChainByNetworkName } from "config/custom-chains";

export default function SafeTenderlySimulationButton({
  address,
  transactions,
}: {
  address: string;
  transactions: GenericTransactionData[];
}) {
  const [shouldSimulate, setShouldSimulate] = useState<boolean>(false);

  const { value: safeTransaction } = useCreateTransaction(
    address,
    transactions,
  );

  const network = useContext(NetworkContext).toLowerCase() as string;
  const networkId = getChainByNetworkName(network)?.id;
  const simulationArgs: TenderlySimulateArgs = {
    from: address,
    to: safeTransaction?.data.to || "",
    value: parseInt(safeTransaction?.data.value || "0"),
    input: safeTransaction?.data.data || "",
    networkId
  };

  useEffect(() => {
    if (shouldSimulate) {
      setShouldSimulate(false);
    }
  }, [transactions]);

  return (
    <div className="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
      <TenderlySimulationButton
        simulationArgs={simulationArgs}
        shouldSimulate={shouldSimulate}
        setShouldSimulate={setShouldSimulate}
      />
    </div>
  );
}
