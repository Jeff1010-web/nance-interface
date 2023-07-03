import { getTerminalDirectory } from 'juice-sdk-v1';
import { useContractReadValue } from './ContractReadValue';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { useEthersProvider } from '../ViemAdapter';

export default function useTerminalOfProject({
  projectId
}: {
  projectId: BigNumberish | undefined
}) {
  const provider = useEthersProvider();
  const contract = getTerminalDirectory(provider);

  return useContractReadValue<string>({
    contract,
    functionName: 'terminalOf',
    args: projectId ? [BigNumber.from(projectId).toHexString()] : null
  });
}