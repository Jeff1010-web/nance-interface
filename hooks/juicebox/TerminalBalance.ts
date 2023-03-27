import { useContract, useProvider } from 'wagmi';
import { getTerminalV1 } from 'juice-sdk-v1';
import { getJBSingleTokenPaymentTerminalStore } from 'juice-sdk';
import { useContractReadValue } from './ContractReadValue';
import { BigNumber } from '@ethersproject/bignumber';
import JBETHPaymentTerminalV2 from '@jbx-protocol/contracts-v2/deployments/mainnet/JBETHPaymentTerminal.json';
import JBETHPaymentTerminalV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBETHPaymentTerminal3_1.json';
import JBSingleTokenPaymentTerminalStoreV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBSingleTokenPaymentTerminalStore3_1.json';

export function useTerminalBalanceV1({
  projectId
}: {
  projectId: number | undefined
}) {
  const provider = useProvider();
  const contract = getTerminalV1(provider);

  return useContractReadValue<BigNumber>({
    contract,
    functionName: 'balanceOf',
    args: projectId ? [projectId] : null
  })
}

export function useTerminalBalance({
  projectId, isV2 = false
}: {
  projectId: number | undefined,
  isV2?: boolean
}) {
  const provider = useProvider();
  const contract = isV2 ? getJBSingleTokenPaymentTerminalStore(provider) : useContract({ address: JBSingleTokenPaymentTerminalStoreV3.address, abi: JBSingleTokenPaymentTerminalStoreV3.abi, signerOrProvider: provider });
  const terminal = isV2 ? JBETHPaymentTerminalV2.address : JBETHPaymentTerminalV3.address;

  return useContractReadValue<BigNumber>({
    contract,
    functionName: 'balanceOf',
    args: terminal && projectId ? [terminal, projectId] : null
  })
}
