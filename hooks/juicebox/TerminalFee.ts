import { useProvider } from 'wagmi';
import { getTerminalV1, getTerminalV1_1 } from 'juice-sdk-v1';
import { useContractReadValue } from './ContractReadValue';
import { BigNumber } from '@ethersproject/bignumber';

const loadTerminalAddress = (
  network: "mainnet" | "rinkeby",
  terminal: "TerminalV1" | "TerminalV1_1" | null,
): string =>
  // NOTE: This require is harder to easily change in the code base as it means
  // making changes to the way the functions in the file are called.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require(`@jbx-protocol/contracts-v1/deployments/${network}/${terminal}.json`)
    .address

export const getTerminalVersion = (
    address?: string | null,
  ): "1" | "1.1" | undefined => {
    if (!address) return
  
    if (
      address.toLowerCase() ===
      loadTerminalAddress(
        "mainnet",
        "TerminalV1",
      ).toLowerCase()
    ) {
      return '1'
    }
  
    if (
      address.toLowerCase() ===
      loadTerminalAddress(
        "mainnet",
        "TerminalV1_1",
      ).toLowerCase()
    ) {
      return '1.1'
    }
  }

export default function useTerminalFee({
  version
}: {
  version: "1" | "1.1" | undefined
}) {
  const provider = useProvider();
  let terminal;
  if(version == "1") {
    terminal = getTerminalV1(provider);
  } else if(version == "1.1") {
    terminal = getTerminalV1_1(provider);
  }

  return useContractReadValue<BigNumber>({
    contract: terminal,
    functionName: 'fee',
    args: undefined
  });
}