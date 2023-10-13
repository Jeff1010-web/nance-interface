import { useContractReadValue } from './ContractReadValue';
import { BigNumber } from '@ethersproject/bignumber';
import useTerminalOfProject from './TerminalOfProject';

export default function useTerminalFee(projectId: number | undefined) {
  const { value: terminal } = useTerminalOfProject(projectId);

  return useContractReadValue<BigNumber>({
    contract: terminal,
    functionName: 'fee',
    args: undefined
  });
}
