import { getContractLabel } from "@/constants/Contract";
import { Action, CustomTransaction, Transfer } from "@nance/nance-sdk";
import { SafeTransactionBuilderTxn } from "@/models/SafeTypes";
import { parseUnits } from "viem";

export function getSafeTxUrl(address: string, hash: string) {
  return `https://app.safe.global/transactions/tx?safe=eth:${address}&id=multisig_${address}_${hash}`;
}

const safeBatchTransactionHeader = (
  space: string,
  chainId: number,
  governanceCycle: string,
  safeAddress: string,
) => {
  return {
    version: "1.0",
    chainId: chainId.toString(),
    createdAt: Date.now(),
    meta: {
      name: `${space} Transactions Batch GC${governanceCycle}`,
      description: "",
      txBuilderVersion: "1.16.3",
      createdFromSafeAddress: safeAddress,
      createdFromOwnerAddress: "",
      checksum: "",
    },
  };
};

export const safeBatchTransactionBuilder = (
  space: string,
  chainId: number,
  governanceCycle: string,
  safeAddress: string,
  transactions: Action[],
) => {
  const header = safeBatchTransactionHeader(space, chainId, governanceCycle, safeAddress);
  const safeBatchTransactions = transactions.map((transaction) => {
    if (transaction.type === "Transfer") {
      const payload = transaction.payload as Transfer;
      const value = getContractLabel(payload.contract) === "ETH" ? payload.amount : "0";
      return {
        to: payload.contract,
        value,
        data: null,
        contractMethod: {
          inputs: [
            { name: "_to", type: "address" },
            { name: "_value", type: "uint256" }
          ],
          name: "transfer",
          payable: false
        },
        contractInputsValues: {
          _to: payload.to,
          _value: parseUnits(payload.amount, payload.decimals).toString()
        }
      } as SafeTransactionBuilderTxn;
    }
    // TODO: Add support for custom transactions
  });
  return {
    ...header,
    transactions: safeBatchTransactions
  };
};