import { useContractReadValue } from './ContractReadValue';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { V2V3FundingCycle, V2V3FundingCycleMetadata } from '../../models/JuiceboxTypes';
import useControllerOfProject from './ControllerOfProject';

export function useCurrentFundingCycle(projectId: BigNumberish | undefined) {
  const { value: controller, version } = useControllerOfProject(projectId);

  return useContractReadValue<[V2V3FundingCycle, V2V3FundingCycleMetadata]>({
    contract: controller,
    functionName: 'currentFundingCycleOf',
    args: projectId ? [BigNumber.from(projectId).toHexString()] : null
  });
}
