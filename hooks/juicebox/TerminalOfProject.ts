import { useProvider } from 'wagmi';
import { getTerminalDirectory } from 'juice-sdk-v1';
import { useContractReadValue } from './ContractReadValue';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

export default function useTerminalOfProject({
  projectId
}: {
  projectId: BigNumberish | undefined
}) {
  const provider = useProvider();
  const contract = getTerminalDirectory(provider);

  return useContractReadValue<string>({
    contract,
    functionName: 'terminalOf',
    args: projectId ? [BigNumber.from(projectId).toHexString()] : null
  });
}