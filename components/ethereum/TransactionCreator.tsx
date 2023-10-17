import { ContractType, useContractType } from "../../hooks/ContractHooks";
import SafeTransactionCreator from "../safe/SafeTransactionCreator";
import GovernorTransactionCreator from "./GovernorTransactionCreator";

export interface GenericTransactionData {
  to: string,
  value: string,
  data: string
}

export default function TransactionCreator({ address, transactions }: { address: string, transactions: GenericTransactionData[] }) {
  const contractType = useContractType(address);
  console.debug("TransactionCreator", { address, contractType });

  if (contractType === ContractType.Safe) {
    return <SafeTransactionCreator safeAddress={address} safeTransaction={transactions} />
  } else if (contractType === ContractType.Governor) {
    return <GovernorTransactionCreator governorAddress={address} transactionDatas={transactions} />
  } else {
    return (
      <span className="isolate inline-flex rounded-md shadow-sm">
        <button
          type="button"
          disabled
          className="relative inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 disabled:opacity-50"
        >
          UnknownContract
        </button>
      </span>
    )
  }
}
