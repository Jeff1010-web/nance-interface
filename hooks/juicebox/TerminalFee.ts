import { getTerminalV1, getTerminalV1_1 } from 'juice-sdk-v1';
import { getJBETHPaymentTerminal } from 'juice-sdk';
import { useContractReadValue } from './ContractReadValue';
import { BigNumber } from '@ethersproject/bignumber';
import JBETHPaymentTerminalV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBETHPaymentTerminal.json';
import { useEthersProvider } from '../ViemAdapter';
import { Contract } from 'ethers';

export default function useTerminalFee({
  version
}: {
  version: "1" | "1.1" | "2" | "3" | undefined
}) {
  const provider = useEthersProvider();
  let terminal;
  if(version == "1") {
    terminal = getTerminalV1(provider);
  } else if(version == "1.1") {
    terminal = getTerminalV1_1(provider);
  } else if (version == "2") {
    terminal = getJBETHPaymentTerminal(provider);
  } else if (version == "3") {
    terminal = new Contract(JBETHPaymentTerminalV3.address, JBETHPaymentTerminalV3.abi, provider);
  }

  return useContractReadValue<BigNumber>({
    contract: terminal,
    functionName: 'fee',
    args: undefined
  });
}