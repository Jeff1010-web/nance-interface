import { useProvider } from 'wagmi';
import { getProjects } from 'juice-sdk-v1';
import { useContractReadValue } from './ContractReadValue';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { parseBytes32String } from '@ethersproject/strings'

export default function useHandleOfProject({
  projectId
}: {
  projectId: BigNumberish | undefined
}) {
  const provider = useProvider();
  const contract = getProjects(provider);

  return useContractReadValue<string>({
    contract,
    functionName: 'handleOf',
    args: projectId ? [BigNumber.from(projectId).toHexString()] : null,
    formatter: (val: string) => parseBytes32String(val)
  });
}