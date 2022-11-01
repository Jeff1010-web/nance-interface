import { useProvider } from 'wagmi';
import { getFundingCycles } from 'juice-sdk-v1';
import { getJBController } from 'juice-sdk';
import { useContractReadValue } from './ContractReadValue';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { useCallback } from 'react';
import { FundingCycleV1, V2V3FundingCycle, V2V3FundingCycleMetadata } from '../../models/JuiceboxTypes';

const deepEqFundingCycles = (a?: FundingCycleV1, b?: FundingCycleV1) => {
  if (a && !b) return false
  if (b && !a) return false
  return (
    a?.ballot === b?.ballot &&
    a?.configured.eq(b?.configured ?? -1) &&
    a?.currency === (b?.currency ?? -1) &&
    a?.cycleLimit === (b?.cycleLimit ?? -1) &&
    a?.discountRate.eq(b?.discountRate ?? -1) &&
    a?.duration.eq(b?.duration ?? -1) &&
    a?.fee.eq(b?.fee ?? -1) &&
    a?.id.eq(b?.id ?? -1) &&
    a?.metadata.eq(b?.metadata ?? -1) &&
    a?.number.eq(b?.number ?? -1) &&
    a?.basedOn.eq(b?.basedOn ?? -1) &&
    a?.projectId.eq(b?.projectId ?? -1) &&
    a?.start.eq(b?.start ?? -1) &&
    a?.tapped.eq(b?.tapped ?? -1) &&
    a?.target.eq(b?.target ?? -1) &&
    a?.weight.eq(b?.weight ?? -1)
  )
}

export default function useCurrentFundingCycle({
  projectId
}: {
  projectId: BigNumberish | undefined
}) {
  const provider = useProvider();
  const contract = getFundingCycles(provider);

  return useContractReadValue<FundingCycleV1>({
    contract,
    functionName: 'currentOf',
    args: projectId ? [BigNumber.from(projectId).toHexString()] : null,
    valueDidChange: useCallback((a, b) => !deepEqFundingCycles(a, b), [])
  })
}

export function useCurrentFundingCycleV2({
  projectId
}: {
  projectId: BigNumberish | undefined
}) {
  const provider = useProvider();
  const contract = getJBController(provider);

  return useContractReadValue<[V2V3FundingCycle, V2V3FundingCycleMetadata]>({
    contract,
    functionName: 'currentFundingCycleOf',
    args: projectId ? [BigNumber.from(projectId).toHexString()] : null
  })
}