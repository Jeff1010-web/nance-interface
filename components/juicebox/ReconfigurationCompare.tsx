import { JBConstants, JBSplit, V2V3FundingCycleMetadata } from "../../models/JuiceboxTypes";
import { BigNumber, utils } from "ethers";
import { formatCurrency } from "../../libs/juicebox";

// 'projectId-beneficiary-allocator': mod
const splits2map = (splits: JBSplit[]) => {
  const map = new Map<string, JBSplit>();
  for (const split of splits) {
    const key = `${split.beneficiary}-${split.projectId}-${split.allocator}`;
    map.set(key, split);
  }
  return map;
};

function orderByPercent(a: JBSplit, b: JBSplit) {
  if (a.percent > b.percent) {
    return -1;
  }
  if (a.percent < b.percent) {
    return 1;
  }
  // a must be equal to b
  return 0;
}

// FIXME shouldn't use magic value 100 here
const almostEqual = (a: BigNumber, b: BigNumber) => {
  return a.sub(b).abs().lte(a.div(100));
};

export interface FundingCycleArgs {
  configuration: BigNumber,
  discountRate: BigNumber,
  ballot: string,
  currency: BigNumber,
  target: BigNumber,
  duration: BigNumber,
  fee: BigNumber,
  weight: BigNumber
}

export interface MetadataArgs {
  // also bonding curve
  redemptionRate: BigNumber
  reservedRate: BigNumber
  // also payIsPaused
  pausePay: boolean
  // also ticketPrintingIsAllowed
  allowMinting: boolean
  allowTerminalMigration: boolean
  allowControllerMigration: boolean
  global: {
    pauseTransfers?: boolean
  }
}

export interface FundingCycleConfigProps {
  version: number,
  fundingCycle: FundingCycleArgs,
  metadata: V2V3FundingCycleMetadata | undefined,
  payoutMods: JBSplit[],
  ticketMods: JBSplit[]
}

export function calculateSplitAmount(percent: BigNumber, target: BigNumber) {
  return parseInt(utils.formatEther(target.mul(percent).div(JBConstants.TotalPercent.Splits[2]) ?? 0));
}

export function splitAmount2Percent(target: BigNumber, amount: number) {
  if (amount <= 0) {
    return BigNumber.from(0);
  }
  return utils.parseEther(amount.toFixed(0)).mul(JBConstants.TotalPercent.Splits[2]).div(target);
}

export function formattedSplit(percent: BigNumber, currency: BigNumber, target: BigNumber, version: number) {
  if (!percent) return undefined;

  const _totalPercent = JBConstants.TotalPercent.Splits[version - 1];
  const _percent = percent.toNumber();

  if (target.eq(JBConstants.UintMax)) {
    return `${(_percent / _totalPercent * 100).toFixed(2)}%`;
  }

  const finalAmount = target.mul(percent).div(_totalPercent);
  return `${(_percent / _totalPercent * 100).toFixed(2)}% (${formatCurrency(currency, finalAmount)})`;
}

function CompareCell({ oldVal, newVal, isSame = false }: { oldVal: any, newVal: any, isSame?: boolean }) {
  const _isSame = isSame || oldVal == newVal;
  const deleted = newVal === undefined;
  const added = oldVal === undefined && newVal !== undefined;

  return (
    <>
      {!deleted ? (
        _isSame ? (
          <td colSpan={2} className="py-5 px-6 text-center text-gray-300">
            <span>{oldVal}</span>
          </td>
          // <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
        ) : (
          added ? (
            <td colSpan={2} className="py-5 px-6 text-center text-green-500">
              <span className="text-gray-500">Added </span>
              <span>{newVal}</span>
            </td>
          ) : (
            <>
              <td className="py-5 px-6">
                <span>{oldVal}</span>
              </td>
              <td className="py-5 px-6 text-yellow-400">
                <span className="text-gray-500">Changed to </span>
                <span>{newVal}</span>
              </td>
            </>
          )
        )
      ) : (
        <td colSpan={2} className="py-5 px-6 text-center text-red-500">
          <span className="text-gray-500">Removed </span>
          <span className="line-through">{oldVal}</span>
        </td>
        //<MinusIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      )}
    </>
  );
}
