import { useContext } from "react";
import { ContractType, useContractType } from "../../utils/hooks/ContractHooks";
import SafeTransactionCreator from "../safe/SafeTransactionCreator";
import GovernorTransactionCreator from "./GovernorTransactionCreator";
import { NetworkContext } from "../../context/NetworkContext";
import { SpaceContext } from "../../context/SpaceContext";
import { useAccount, useSwitchNetwork } from "wagmi";
import { mainnet, goerli } from "wagmi/chains";

export interface GenericTransactionData {
  to: string,
  value: string,
  data: string
}

export default function TransactionCreator({ address, transactions }: { address: string, transactions: GenericTransactionData[] }) {
  const contractType = useContractType(address);
  const { isConnected } = useAccount();
  const { switchNetwork } = useSwitchNetwork();

  const spaceInfo = useContext(SpaceContext);
  const _network = useContext(NetworkContext);
  const network = _network.toLowerCase() === "ethereum" ? "mainnet" : _network.toLowerCase();
  const supportedNetwork = spaceInfo?.transactorAddress?.network;
  const networkIsSupported = supportedNetwork ? network === supportedNetwork : true;
  const supportedChainId = supportedNetwork === "mainnet" ? mainnet.id : goerli.id;

  if (isConnected && !networkIsSupported) {
    return (
      <span className="isolate inline-flex rounded-md shadow-sm">
        <button
          type="button"
          disabled={!switchNetwork}
          onClick={() => {
            switchNetwork?.(supportedChainId);
          }}
          className="relative inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 disabled:opacity-50"
        >
          {switchNetwork ? "Switch network" : `Not on ${spaceInfo?.transactorAddress?.network}`}
        </button>
      </span>
    )
  }

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
