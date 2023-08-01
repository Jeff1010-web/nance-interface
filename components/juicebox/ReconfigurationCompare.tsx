import { JBConstants, JBSplit } from "../../models/JuiceboxTypes";
import FormattedAddress from "../FormattedAddress";
// unionBy([2.1], [1.2, 2.3], Math.floor);
// => [2.1, 1.2]
// @ts-ignore
import unionBy from 'lodash.unionby';
import { BigNumber, utils } from "ethers";
import ResolvedProject from "../ResolvedProject";
import { formatDistanceToNow, fromUnixTime } from "date-fns";
import { Payout, SQLPayout } from "../../models/NanceTypes";
import { ZERO_ADDRESS } from "../../constants/Contract";

// 'projectId-beneficiary-allocator': mod
const splits2map = (splits: JBSplit[]) => {
  const map = new Map<string, JBSplit>();
  for (const split of splits) {
    const key = `${split.beneficiary}-${split.projectId}-${split.allocator}`;
    map.set(key, split);
  }
  return map;
};
export const keyOfSplit = (mod: JBSplit) => `${mod.beneficiary}-${mod.projectId}-${mod.allocator}`;
export const keyOfPayout2Split = (mod: Payout) => `${mod.address}-${mod.project}-${ZERO_ADDRESS}`;
export const keyOfNancePayout2Split = (mod: SQLPayout) => `${mod.payAddress}-${mod.payProject ?? 0}-${ZERO_ADDRESS}`;
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
const formatter = new Intl.NumberFormat('en-GB', { style: "decimal" });
const formatNumber = (num: number) => formatter.format(num);
// In v1, ETH = 0, USD = 1
// In v2, ETH = 1, USD = 2, we subtract 1 to get the same value
export const formatCurrency = (currency: BigNumber, amount: BigNumber) => {
  const symbol = currency.toNumber() == 0 ? "Ξ" : "$";
  const formatted = amount.gte(JBConstants.UintMax) ? "∞" : formatNumber(parseInt(utils.formatEther(amount ?? 0)));
  return symbol + formatted;
};

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
  fee: BigNumber
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
}

export interface FundingCycleConfigProps {
  version: number,
  fundingCycle: FundingCycleArgs,
  metadata: MetadataArgs,
  payoutMods: JBSplit[],
  ticketMods: JBSplit[]
}

interface ReconfigurationCompareProps {
  currentFC: FundingCycleConfigProps,
  previewFC: FundingCycleConfigProps
}

export default function ReconfigurationCompare({ currentFC, previewFC }: ReconfigurationCompareProps) {
  const configFormatter: {
    name: string;
    getFunc: (fc: FundingCycleConfigProps) => any;
  }[] = [
    { name: 'Reserve rate', getFunc: (fc) => fc.metadata.reservedRate.toNumber() / JBConstants.TotalPercent.ReservedRate[fc.version - 1] * 100 + "%" },
    { name: 'Rdemption rate', getFunc: (fc) => fc.metadata.redemptionRate.toNumber() / JBConstants.TotalPercent.RedemptionRate[fc.version - 1] * 100 + "%" },
    { name: 'Discount rate', getFunc: (fc) => fc.fundingCycle.discountRate.toNumber() / JBConstants.TotalPercent.DiscountRate[fc.version - 1] * 100 + "%" },
    { name: 'Payments', getFunc: (fc) => fc.metadata.pausePay ? "Disabled" : "Enabled" },
    { name: 'Token minting', getFunc: (fc) => fc.metadata.allowMinting ? "Enabled" : "Disabled" },
    { name: 'Terminal migration', getFunc: (fc) => fc.metadata.allowTerminalMigration ? "Enabled" : "Disabled" },
    { name: 'Controller migration', getFunc: (fc) => fc.metadata.allowControllerMigration ? "Enabled" : "Disabled" },
    { name: 'Reconfiguration strategy', getFunc: (fc) => <FormattedAddress key={fc.fundingCycle.ballot} address={fc.fundingCycle.ballot} /> },
    //{name: 'Reconfiguration strategy', getFunc: (fc) => fc.fundingCycle.ballot},
  ];

  const payouts: JBSplit[] = unionBy(currentFC.payoutMods, previewFC.payoutMods, keyOfSplit).sort(orderByPercent);
  const currentPayoutMaps = splits2map(currentFC.payoutMods);
  const previewPayoutMaps = splits2map(previewFC.payoutMods);
  const tickets: JBSplit[] = unionBy(currentFC.ticketMods, previewFC.ticketMods, keyOfSplit).sort(orderByPercent);
  const currentTicketMaps = splits2map(currentFC.ticketMods);
  const previewTicketMaps = splits2map(previewFC.ticketMods);

  return (
    <div>
      <div className="mx-auto max-w-7xl bg-white py-4 sm:py-6 sm:px-6 lg:px-8">
        {/* xs to lg */}
        <div className="mx-auto max-w-2xl space-y-16 md:hidden">
          <p>Please use desktop for better experience for now</p>
        </div>

        {/* lg+ */}
        <div className="hidden md:block">
          <table className="h-px w-full table-fixed">
            <caption className="sr-only">Juicebox reconfiguration comparison</caption>
            {/* Head */}
            <thead>
              <tr>
                <th className="px-6 pb-4 text-left text-sm font-medium text-gray-900" scope="col">
                  <span className="sr-only">Feature by</span>
                  <span>Time</span>
                </th>
                <th
                  className="w-1/4 px-6 pb-4 text-left text-lg font-medium leading-6 text-gray-900"
                  scope="col"
                >
                  {formatDistanceToNow(fromUnixTime(currentFC.fundingCycle.configuration.toNumber()), { addSuffix: true })}
                </th>
                <th
                  className="w-1/4 px-6 pb-4 text-left text-lg font-medium leading-6 text-gray-900"
                  scope="col"
                >
                  {formatDistanceToNow(fromUnixTime(previewFC.fundingCycle.configuration.toNumber()), { addSuffix: true })}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 border-t border-gray-200">
              <tr>
                <th className="py-8 px-6 text-left align-top text-sm font-medium text-gray-900" scope="row">
                  Target
                </th>
                <td className="h-full py-8 px-6 align-top">
                  <div className="relative table h-full">
                    <p>
                      <span className="text-4xl font-bold tracking-tight text-gray-900">{formatCurrency(currentFC.fundingCycle.currency, currentFC.fundingCycle.target)}</span>{' '}
                      <span className="text-base font-medium text-gray-500">/{currentFC.fundingCycle.duration.toNumber() / JBConstants.DurationUnit[currentFC.version - 1]}&nbsp;days</span>
                    </p>
                  </div>
                </td>
                <td className="h-full py-8 px-6 align-top">
                  <div className="relative table h-full">
                    <p>
                      <span className="text-4xl font-bold tracking-tight text-gray-900">{formatCurrency(previewFC.fundingCycle.currency, previewFC.fundingCycle.target)}</span>{' '}
                      <span className="text-base font-medium text-gray-500">/{previewFC.fundingCycle.duration.toNumber() / JBConstants.DurationUnit[previewFC.version - 1]}&nbsp;days</span>
                    </p>
                  </div>
                </td>
              </tr>

              {/* Config */}
              <>
                <tr>
                  <th
                    className="bg-gray-50 py-3 pl-6 text-left text-sm font-medium text-gray-900"
                    colSpan={3}
                    scope="colgroup"
                  >
                    Config
                  </th>
                </tr>

                {configFormatter.map((config) => (
                  <tr key={config.name}>
                    <th className="py-5 px-6 text-left text-sm font-normal text-gray-500" scope="row">
                      {config.name}
                    </th>

                    <CompareCell
                      oldVal={config.getFunc(currentFC)}
                      newVal={config.getFunc(previewFC)}
                      isSame={config.name == "Reconfiguration strategy" && currentFC.fundingCycle.ballot === previewFC.fundingCycle.ballot} />
                  </tr>
                ))}
              </>

              {/* Payout */}
              <>
                <tr>
                  <th
                    className="bg-gray-50 py-3 pl-6 text-left text-sm font-medium text-gray-900"
                    colSpan={3}
                    scope="colgroup"
                  >
                    Funding distribution
                  </th>
                </tr>

                {payouts.map((mod) => (
                  <tr key={keyOfSplit(mod)}>
                    <th className="py-5 px-6 text-left text-sm font-normal text-gray-500" scope="row">
                      <div className="flex flex-col">
                        <SplitEntry mod={mod} projectVersion={currentPayoutMaps.has(keyOfSplit(mod)) ? currentFC.version : previewFC.version} />
                      </div>
                    </th>

                    <CompareCell
                      oldVal={formattedSplit(
                        currentPayoutMaps.get(keyOfSplit(mod))?.percent || BigNumber.from(0),
                        currentFC.fundingCycle.currency,
                        currentFC.fundingCycle.target,
                        currentFC.fundingCycle.fee,
                        currentFC.version
                      )}
                      newVal={formattedSplit(
                        previewPayoutMaps.get(keyOfSplit(mod))?.percent || BigNumber.from(0),
                        previewFC.fundingCycle.currency,
                        previewFC.fundingCycle.target,
                        previewFC.fundingCycle.fee,
                        previewFC.version
                      )}
                      isSame={almostEqual(currentFC.fundingCycle.target.mul(currentPayoutMaps.get(keyOfSplit(mod))?.percent ?? 0), previewFC.fundingCycle.target.mul(previewPayoutMaps.get(keyOfSplit(mod))?.percent ?? 0))} />
                  </tr>
                ))}
              </>

              {/* Reserve */}
              <>
                <tr>
                  <th
                    className="bg-gray-50 py-3 pl-6 text-left text-sm font-medium text-gray-900"
                    colSpan={3}
                    scope="colgroup"
                  >
                    Reserve tokens
                  </th>
                </tr>

                {tickets.map((mod) => (
                  <tr key={keyOfSplit(mod)}>
                    <th className="py-5 px-6 text-left text-sm font-normal text-gray-500" scope="row">
                      {/* {mod.projectId.toNumber() != 0 && <ResolvedProject version={currentTicketMaps.has(keyOfSplit(mod)) ? currentFC.version : previewFC.version} projectId={mod.projectId.toNumber()} />}
                                    <FormattedAddress address={mod.beneficiary} />:&nbsp; */}
                      <SplitEntry mod={mod} projectVersion={currentTicketMaps.has(keyOfSplit(mod)) ? currentFC.version : previewFC.version} />
                    </th>
                    <CompareCell
                      oldVal={currentTicketMaps.has(keyOfSplit(mod)) ? `${(currentTicketMaps.get(keyOfSplit(mod))!.percent.toNumber() / 10000000 ?? 0 / JBConstants.TotalPercent.Splits[currentFC.version - 1] * 100).toFixed(2)}%` : undefined}
                      newVal={previewTicketMaps.has(keyOfSplit(mod)) ? `${(previewTicketMaps.get(keyOfSplit(mod))!.percent.toNumber() / 10000000 ?? 0 / JBConstants.TotalPercent.Splits[previewFC.version - 1] * 100).toFixed(2)}%` : undefined} />
                  </tr>
                ))}
              </>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function calculateSplitAmount(percent: BigNumber, target: BigNumber) {
  return parseInt(utils.formatEther(target.mul(percent).div(JBConstants.TotalPercent.Splits[2]) ?? 0));
}

export function formattedSplit(percent: BigNumber, currency: BigNumber, target: BigNumber, fee: BigNumber, version: number) {
  if (!percent) return undefined;

  const _totalPercent = JBConstants.TotalPercent.Splits[version - 1];
  const _percent = percent.toNumber();

  if (target.eq(JBConstants.UintMax)) {
    return `${(_percent / _totalPercent * 100).toFixed(2)}%`;
  }

  const finalAmount = target.mul(percent).div(_totalPercent);
  return `${(_percent / _totalPercent * 100).toFixed(2)}% (${formatCurrency(currency, finalAmount)})`;
}

export function SplitEntry({ mod, projectVersion }: { mod: JBSplit, projectVersion: number }) {
  let splitMode = "address";
  if (mod.allocator !== "0x0000000000000000000000000000000000000000") splitMode = "allocator";
  else if (mod.projectId.toNumber() !== 0) splitMode = "project";

  const mainStyle = "text-sm font-semibold";
  const subStyle = "text-xs italic";

  return (
    <>
      {splitMode === "allocator" && (
        <>
          <FormattedAddress address={mod.allocator} style={mainStyle} />
          <a href="https://info.juicebox.money/dev/learn/glossary/split-allocator/" target="_blank" rel="noreferrer">(Allocator)</a>
          <ResolvedProject version={projectVersion} projectId={mod.projectId.toNumber()} style={subStyle} />
          <FormattedAddress address={mod.beneficiary} style={subStyle} />
        </>
      )}

      {splitMode === "project" && (
        <>
          <ResolvedProject version={projectVersion} projectId={mod.projectId.toNumber()} style={mainStyle} />
          <FormattedAddress address={mod.beneficiary} style={subStyle} />
        </>
      )}

      {/* Address mode */}
      {splitMode === "address" && (
        <>
          <FormattedAddress address={mod.beneficiary} style={mainStyle} />
        </>
      )}
    </>
  );
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
