import { BigNumber } from '@ethersproject/bignumber';

export type PayoutModV1 = {
    preferUnstaked: boolean;
    percent: number;
    lockedUntil: number;
    beneficiary: string;
    allocator: string;
    projectId: BigNumber;
};

export type TicketModV1 = {
    preferUnstaked: boolean;
    percent: number;
    lockedUntil: number;
    beneficiary: string;
};

export type FundingCycleV1 = {
    id: BigNumber;
    projectId: BigNumber;
    number: BigNumber;
    basedOn: BigNumber;
    configured: BigNumber;
    cycleLimit: BigNumber;
    weight: BigNumber;
    ballot: string;
    start: BigNumber;
    duration: BigNumber;
    target: BigNumber;
    currency: BigNumber;
    fee: BigNumber;
    discountRate: BigNumber;
    tapped: BigNumber;
    metadata: BigNumber;
};

export type FundingCycleV1Args = {
    fee: BigNumber;
    projectId: BigNumber;
    cycleLimit: BigNumber;
    ballot: string;
    duration: BigNumber;
    target: BigNumber;
    currency: BigNumber;
    discountRate: BigNumber;
}

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

export type V1FundingCycleMetadata =
  | FundingCycleMetadataV0
  | FundingCycleMetadataV1

function hexToBytes(hex: string) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

export function parseV1Metadata(raw: { toHexString: () => string; }): V1FundingCycleMetadata {
    if(!raw) return;
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