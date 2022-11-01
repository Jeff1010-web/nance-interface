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

enum V2SplitGroup {
    ETH = 1,
    RESERVED_TOKEN = 2
}

export type JBGroupedSplits = {
    group: BigNumber;
    splits: JBSplit[];
  }

export type JBSplit = {
    preferClaimed: boolean;
    preferAddToBalance: boolean;
    percent: BigNumber;
    lockedUntil: BigNumber;
    beneficiary: string;
    projectId: BigNumber;
    allocator: string | undefined // address, If an allocator is specified, funds will be sent to the allocator contract along with the projectId, beneficiary, preferClaimed properties.
}

export type JBFundAccessConstraints = {
    terminal: string;
    token: string;
    distributionLimit: BigNumber;
    distributionLimitCurrency: BigNumber;
    overflowAllowance: BigNumber;
    overflowAllowanceCurrency: BigNumber;
}

export type V2V3FundingCycleData = {
    duration: BigNumber
    weight: BigNumber
    discountRate: BigNumber
    ballot: string // hex, contract address
}

export type V2V3FundingCycle = V2V3FundingCycleData & {
    number: BigNumber
    configuration: BigNumber
    basedOn: BigNumber
    start: BigNumber
    metadata: BigNumber // encoded FundingCycleMetadata
}

export type BaseV2V3FundingCycleMetadata = {
    version?: number
    reservedRate: BigNumber
    redemptionRate: BigNumber
    ballotRedemptionRate: BigNumber
    pausePay: boolean
    pauseDistributions: boolean
    pauseRedeem: boolean
    pauseBurn: boolean
    allowMinting: boolean
    allowTerminalMigration: boolean
    allowControllerMigration: boolean
    holdFees: boolean
    useTotalOverflowForRedemptions: boolean
    useDataSourceForPay: boolean
    useDataSourceForRedeem: boolean
    dataSource: string // hex, contract address
}
  
export type BaseV2V3FundingCycleMetadataGlobal = {
    allowSetController: boolean
    allowSetTerminals: boolean
}

export type V2FundingCycleMetadataGlobal = BaseV2V3FundingCycleMetadataGlobal

export type V2FundingCycleMetadata = BaseV2V3FundingCycleMetadata & {
    global: BaseV2V3FundingCycleMetadataGlobal
    allowChangeToken: boolean
}

export type V3FundingCycleMetadataGlobal =
  BaseV2V3FundingCycleMetadataGlobal & {
    pauseTransfers?: boolean
  }

export type V3FundingCycleMetadata = BaseV2V3FundingCycleMetadata & {
  global: V3FundingCycleMetadataGlobal
  preferClaimedTokenOverride?: boolean
  metadata?: BigNumber
}

export type V2V3FundingCycleMetadata =
  | V2FundingCycleMetadata
  | V3FundingCycleMetadata

// Generic

export const JBConstants = {
    SplitGroup: V2SplitGroup,
    TotalPercent: {
        Splits: [10000, 1000000000, 1000000000],
        ReservedRate: [200, 10000, 10000],
        RedemptionRate: [200, 10000, 10000],
        DiscountRate: [1000, 1000000000, 1000000000],
    },
    UintMax: BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
    DurationUnit: [1, 86400, 86400]
}

export function payoutMod2Split(payoutMod: PayoutModV1): JBSplit {
    return {
        preferClaimed: payoutMod.preferUnstaked,
        preferAddToBalance: false,
        percent: BigNumber.from(payoutMod.percent),
        lockedUntil: BigNumber.from(payoutMod.lockedUntil),
        beneficiary: payoutMod.beneficiary,
        projectId: payoutMod.projectId,
        allocator: payoutMod.allocator
    }
}

export function ticketMod2Split(ticketMod: TicketModV1): JBSplit {
    return {
        preferClaimed: ticketMod.preferUnstaked,
        preferAddToBalance: true,
        percent: BigNumber.from(ticketMod.percent),
        lockedUntil: BigNumber.from(ticketMod.lockedUntil),
        beneficiary: ticketMod.beneficiary,
        projectId: BigNumber.from(0),
        allocator: '0'
    }
}