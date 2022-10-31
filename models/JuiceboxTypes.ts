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

// === V2 ===

// uint256 public constant MAX_RESERVED_RATE = 10000;
// uint256 public constant MAX_REDEMPTION_RATE = 10000;
// uint256 public constant MAX_DISCOUNT_RATE = 1000000000;
// uint256 public constant SPLITS_TOTAL_PERCENT = 1000000000;
export const ETH_PAYOUT_SPLIT_GROUP = 1
export const RESERVED_TOKEN_SPLIT_GROUP = 2
export const SPLITS_TOTAL_PERCENT = 1000000000;

export type Split = {
    preferClaimed: boolean;
    preferAddToBalance: boolean;
    percent: number;
    lockedUntil: number;
    beneficiary: string;
    projectId: BigNumber;
    allocator: string | undefined // address, If an allocator is specified, funds will be sent to the allocator contract along with the projectId, beneficiary, preferClaimed properties.
}