import { useProvider } from 'wagmi';
import { getFundingCycles } from 'juice-sdk-v1';
import { useContractReadValue } from './ContractReadValue';
import { FundingCycleStructOutput } from '../../types/contracts/v1/FundingCycles';
import { BigNumber } from '@ethersproject/bignumber';
import { useCallback } from 'react';

export type FundingCycleMetadataV0 = {
  version: 0
  bondingCurveRate: number
  reconfigurationBondingCurveRate: number
  reservedRate: number
  payIsPaused: null
  ticketPrintingIsAllowed: null
  treasuryExtension: null
}

export type FundingCycleMetadataV1 = {
  version: 1
  bondingCurveRate: number
  reconfigurationBondingCurveRate: number
  reservedRate: number
  payIsPaused: boolean
  ticketPrintingIsAllowed: boolean
  treasuryExtension: string
}

function hexToBytes(hex: string) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

function parseMetadata(raw: { toHexString: () => string; }): V1FundingCycleMetadata {
  const bytes = hexToBytes(raw.toHexString()).reverse();
  let ret: V1FundingCycleMetadata = {
    version: bytes[0],
    reservedRate: bytes[1],
    bondingCurveRate: bytes[2],
    reconfigurationBondingCurveRate: bytes[3],
    payIsPaused: bytes[0] == 1 ? bytes[4] : null,
    ticketPrintingIsAllowed: bytes[0] == 1 ? bytes[5] : null,
    treasuryExtension: ''
  }
  return ret;
}

export type V1FundingCycleMetadata =
  | FundingCycleMetadataV0
  | FundingCycleMetadataV1

export type ParsedFundingCycle = {
  fundingCycleData: FundingCycleStructOutput;
  fundingCycleMetadata: V1FundingCycleMetadata;
};

const deepEqFundingCycles = (_a?: ParsedFundingCycle, _b?: ParsedFundingCycle) => {
  if (_a && !_b) return false
  if (_b && !_a) return false
  const a = _a.fundingCycleData
  const b = _b.fundingCycleData
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
  projectId,
}: {
  projectId: number;
}) {
  const provider = useProvider();
  const contract = getFundingCycles(provider);

  return useContractReadValue<ParsedFundingCycle>({
    contract,
    functionName: 'currentOf',
    args: projectId ? [BigNumber.from(projectId).toHexString()] : null,
    valueDidChange: useCallback((a, b) => !deepEqFundingCycles(a, b), []),
    formatter: (raw: FundingCycleStructOutput) => {
      return {
        fundingCycleData: raw,
        fundingCycleMetadata: parseMetadata(raw.metadata)
      }
    }
  })
}