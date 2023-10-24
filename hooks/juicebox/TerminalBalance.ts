import { getJBSingleTokenPaymentTerminalStore } from 'juice-sdk';
import { useContractReadValue } from './ContractReadValue';
import { BigNumber } from '@ethersproject/bignumber';
import { useEthersProvider } from '../ViemAdapter';
import useTerminalOfProject from './TerminalOfProject';

export function useTerminalBalance(projectId: number | undefined) {
  const provider = useEthersProvider();
  const contract = getJBSingleTokenPaymentTerminalStore(provider);
  const { value: terminal } = useTerminalOfProject(projectId);

  return useContractReadValue<BigNumber>({
    contract,
    functionName: 'balanceOf',
    args: terminal && projectId ? [terminal, projectId] : null
  });
}
