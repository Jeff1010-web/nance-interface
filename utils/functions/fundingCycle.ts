import {
  JBConstants,
  JBSplit,
  V2V3FundingCycleMetadata,
} from "@/models/JuiceboxTypes";
import { BigNumber } from "ethers";
import { formatCurrency } from "@/utils/functions/juicebox";

export interface FundingCycleArgs {
  configuration: BigNumber;
  discountRate: BigNumber;
  ballot: string;
  currency: BigNumber;
  target: BigNumber;
  duration: BigNumber;
  fee: BigNumber;
  weight: BigNumber;
}

export interface MetadataArgs {
  // also bonding curve
  redemptionRate: BigNumber;
  reservedRate: BigNumber;
  // also payIsPaused
  pausePay: boolean;
  // also ticketPrintingIsAllowed
  allowMinting: boolean;
  allowTerminalMigration: boolean;
  allowControllerMigration: boolean;
  global: {
    pauseTransfers?: boolean;
  };
}

export interface FundingCycleConfigProps {
  version: number;
  fundingCycle: FundingCycleArgs;
  metadata: V2V3FundingCycleMetadata | undefined;
  payoutMods: JBSplit[];
  ticketMods: JBSplit[];
}

export function calculateSplitAmount(percent: BigNumber, target: BigNumber) {
  const _totalPercent = JBConstants.TotalPercent.Splits[2];
  const amount = target.mul(percent).div(_totalPercent);
  const ret = amount.div(ETHER);
  return ret.toNumber();
}

const ETHER = BigNumber.from("1000000000000000000");

export function splitAmount2Percent(target: BigNumber, amount: number) {
  if (amount <= 0) {
    return BigNumber.from(0);
  }
  const totalPercent = BigNumber.from(JBConstants.TotalPercent.Splits[2]);
  const percent = ETHER.mul(totalPercent).mul(amount).div(target);
  return percent;
}

export function isEqualPayoutSplit(
  percent: BigNumber,
  currency: BigNumber,
  target: BigNumber,
  newPercent: BigNumber,
  newCurrency: BigNumber,
  newTarget: BigNumber,
) {
  if (!percent || !newPercent) return undefined;

  const _totalPercent = JBConstants.TotalPercent.Splits[2];

  if (target.eq(JBConstants.UintMax) && newTarget.eq(JBConstants.UintMax)) {
    return percent.eq(newPercent);
  } else if (
    !target.eq(JBConstants.UintMax) &&
    !newTarget.eq(JBConstants.UintMax)
  ) {
    const amount = formatCurrency(
      currency,
      target.mul(percent).div(_totalPercent),
    );
    const newAmount = formatCurrency(
      newCurrency,
      newTarget.mul(newPercent).div(_totalPercent),
    );
    return amount === newAmount;
  } else {
    return false;
  }
}

export function formattedSplit(
  percent: BigNumber,
  currency: BigNumber,
  target: BigNumber,
  version: number,
) {
  if (!percent) return undefined;

  const _totalPercent = JBConstants.TotalPercent.Splits[version - 1];
  const _percent = percent.toNumber();

  if (target.eq(JBConstants.UintMax)) {
    return `${((_percent / _totalPercent) * 100).toFixed(2)}%`;
  }

  const finalAmount = target.mul(percent).div(_totalPercent);
  return `${((_percent / _totalPercent) * 100).toFixed(2)}% (${formatCurrency(
    currency,
    finalAmount,
  )})`;
}
