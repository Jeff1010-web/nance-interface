import { useProvider, useContract } from 'wagmi';
import { getTerminalV1, getTerminalV1_1 } from 'juice-sdk-v1';
import { getJBETHPaymentTerminal } from 'juice-sdk';
import { useContractReadValue } from './ContractReadValue';
import { BigNumber } from '@ethersproject/bignumber';
import JBETHPaymentTerminalV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBETHPaymentTerminal.json';

export default function useTerminalFee({
  version
}: {
  version: "1" | "1.1" | "2" | "3" | undefined
}) {
  const provider = useProvider();
  let terminal;
  if(version == "1") {
    terminal = getTerminalV1(provider);
  } else if(version == "1.1") {
    terminal = getTerminalV1_1(provider);
  } else if (version == "2") {
    terminal = getJBETHPaymentTerminal(provider);
  } else if (version == "3") {
    terminal = useContract({address: JBETHPaymentTerminalV3.address, abi: JBETHPaymentTerminalV3.abi, signerOrProvider: provider});
  }

  return useContractReadValue<BigNumber>({
    contract: terminal,
    functionName: 'fee',
    args: undefined
  });
}