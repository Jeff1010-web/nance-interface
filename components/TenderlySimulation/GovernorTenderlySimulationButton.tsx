import { useAccount } from "wagmi";
import { TenderlySimulateArgs } from "@/utils/hooks/TenderlyHooks";
import TenderlySimulationButton from "./TenderlySimulationButton";
import { encodeFunctionData } from "viem";
import { PROPOSE_ABI } from "@/utils/hooks/governor/Propose";
import { useEffect, useState } from "react";
import { GenericTransactionData } from "../Transaction/TransactionCreator";

export default function GovernorTenderlySimulationButton({
  address,
  transactions,
}: {
  address: string;
  transactions: GenericTransactionData[];
}) {
  const [shouldSimulate, setShouldSimulate] = useState<boolean>(false);

  const { address: userAddress } = useAccount();

  const proposeData = encodeFunctionData({
    abi: PROPOSE_ABI,
    functionName: "propose",
    args: [
      transactions.map(
        (transactionData) => transactionData.to as `0x${string}`,
      ),
      transactions.map((transactionData) => transactionData.value),
      transactions.map((transactionData) => transactionData.data),
      "Queued from nance.app",
    ],
  });

  const simulationArgs: TenderlySimulateArgs = {
    from: userAddress || "",
    to: address,
    value: 0,
    input: proposeData || "",
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
