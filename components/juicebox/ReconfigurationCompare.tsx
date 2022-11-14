import { JBConstants, JBSplit } from "../../models/JuiceboxTypes";
import FormattedAddress from "../FormattedAddress";
// unionBy([2.1], [1.2, 2.3], Math.floor);
// => [2.1, 1.2]
import unionBy from 'lodash.unionby';
import { BigNumber, utils } from "ethers";
import { CheckIcon, MinusIcon } from '@heroicons/react/solid';
import ResolvedProject from "../ResolvedProject";
import { amountSubFee, amountSubFeeV2 } from "../../libs/math";
import { formatDistanceToNow, fromUnixTime } from "date-fns";

// 'projectId-beneficiary-allocator': mod
const splits2map = (splits: JBSplit[]) => {
    const map = new Map<string, JBSplit>()
    for (const split of splits) {
      const key = `${split.beneficiary}-${split.projectId}-${split.allocator}`
      map.set(key, split)
    }
    return map
}
const keyOfSplit = (mod: JBSplit) => `${mod.beneficiary}-${mod.projectId}-${mod.allocator}`;
function orderByPercent(a: { percent: number; }, b: { percent: number; }) {
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
const formatNumber = (num) => formatter.format(num);
// In v1, ETH = 0, USD = 1
// In v2, ETH = 1, USD = 2, we subtract 1 to get the same value
const formatCurrency = (currency: BigNumber, amount: BigNumber) => {
    const symbol = currency.toNumber() == 0 ? "Ξ" : "$";
    const formatted = amount.eq(JBConstants.UintMax) ? "∞" : formatNumber(utils.formatEther(amount ?? 0));
    return symbol + formatted;
}

const almostEqual = (a: BigNumber, b: BigNumber) => {
    return a.sub(b).abs().lte(a.div(100));
}

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

export default function ReconfigurationCompare({currentFC, previewFC}: ReconfigurationCompareProps) {
    const configFormatter: {
      name: string;
      getFunc: (fc: FundingCycleConfigProps) => any[];
    }[] = [
        {name: 'Reserve rate', getFunc: (fc) => [
            fc.metadata.reservedRate.toNumber(), 
            fc.metadata.reservedRate.toNumber() / JBConstants.TotalPercent.ReservedRate[fc.version-1] * 100 + "%"
        ]},
        {name: 'Rdemption rate', getFunc: (fc) => [
            fc.metadata.redemptionRate.toNumber(), 
            fc.metadata.redemptionRate.toNumber() / JBConstants.TotalPercent.RedemptionRate[fc.version-1] * 100 + "%"
        ]},
        {name: 'Discount rate', getFunc: (fc) => [
            fc.fundingCycle.discountRate.toNumber(), 
            fc.fundingCycle.discountRate.toNumber() / JBConstants.TotalPercent.DiscountRate[fc.version-1] * 100 + "%"
        ]},
        {name: 'Payments', getFunc: (fc) => [
            fc.metadata.pausePay, 
            fc.metadata.pausePay ? "Disabled" : "Enabled"
        ]},
        {name: 'Token minting', getFunc: (fc) => [
            fc.metadata.allowMinting, 
            fc.metadata.allowMinting ? "Enabled" : "Disabled"
        ]},
        {name: 'Terminal migration', getFunc: (fc) => [
            fc.metadata.allowTerminalMigration, 
            fc.metadata.allowTerminalMigration ? "Enabled" : "Disabled"
        ]},
        {name: 'Controller migration', getFunc: (fc) => [
            fc.metadata.allowControllerMigration, 
            fc.metadata.allowControllerMigration ? "Enabled" : "Disabled"
        ]},
        {name: 'Reconfiguration strategy', getFunc: (fc) => [
            fc.fundingCycle.ballot, 
            <FormattedAddress key={fc.fundingCycle.ballot} address={fc.fundingCycle.ballot} />
        ]},      
    ]
  
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
                                    <span className="text-base font-medium text-gray-500">/{currentFC.fundingCycle.duration.toNumber() / JBConstants.DurationUnit[currentFC.version-1]}&nbsp;days</span>
                                </p>
                            </div>
                        </td>
                        <td className="h-full py-8 px-6 align-top">
                            <div className="relative table h-full">
                                <p>
                                    <span className="text-4xl font-bold tracking-tight text-gray-900">{formatCurrency(previewFC.fundingCycle.currency, previewFC.fundingCycle.target)}</span>{' '}
                                    <span className="text-base font-medium text-gray-500">/{previewFC.fundingCycle.duration.toNumber() / JBConstants.DurationUnit[previewFC.version-1]}&nbsp;days</span>
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

                                <td className="py-5 px-6">
                                    <span>{config.getFunc(currentFC)[1]}</span>
                                </td>

                                <td className="py-5 px-6">
                                    <CompareCell hasValue={config.getFunc(previewFC)[0] !== undefined} isSame={config.getFunc(currentFC)[0] == config.getFunc(previewFC)[0]} valueGetter={() => config.getFunc(previewFC)[1]} />
                                </td>
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
                                        {mod.projectId.toNumber() != 0 && <ResolvedProject version={currentPayoutMaps.has(keyOfSplit(mod)) ? currentFC.version : previewFC.version} projectId={mod.projectId.toNumber()} style="font-semibold" />}
                                        <FormattedAddress address={mod.beneficiary} style={mod.projectId.toNumber() != 0 ? "text-xs italic" : "font-semibold"} />
                                    </div>
                                </th>

                                <td className="py-5 px-6">
                                    <CompareCell 
                                        hasValue={currentPayoutMaps.has(keyOfSplit(mod))}
                                        valueGetter={() => formattedSplit(
                                            currentPayoutMaps.get(keyOfSplit(mod)).percent,
                                            currentFC.fundingCycle.currency,
                                            currentFC.fundingCycle.target, 
                                            currentFC.fundingCycle.fee,
                                            currentFC.version
                                        )} />
                                </td>

                                <td className="py-5 px-6">
                                    <CompareCell 
                                        hasValue={previewPayoutMaps.has(keyOfSplit(mod))}
                                        isSame={almostEqual(currentFC.fundingCycle.target.mul(currentPayoutMaps.get(keyOfSplit(mod))?.percent ?? 0), previewFC.fundingCycle.target.mul(previewPayoutMaps.get(keyOfSplit(mod))?.percent ?? 0))}
                                        valueGetter={() => formattedSplit(
                                            previewPayoutMaps.get(keyOfSplit(mod)).percent,
                                            previewFC.fundingCycle.currency,
                                            previewFC.fundingCycle.target, 
                                            previewFC.fundingCycle.fee,
                                            previewFC.version
                                        )} />
                                </td>
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
                                    {mod.projectId.toNumber() != 0 && <ResolvedProject version={currentTicketMaps.has(keyOfSplit(mod)) ? currentFC.version : previewFC.version} projectId={mod.projectId.toNumber()} />}
                                    <FormattedAddress address={mod.beneficiary} />:&nbsp;
                                </th>

                                <td className="py-5 px-6">
                                    <CompareCell 
                                        hasValue={currentTicketMaps.has(keyOfSplit(mod))}
                                        valueGetter={() => `${(currentTicketMaps.get(keyOfSplit(mod)).percent.toNumber()/JBConstants.TotalPercent.Splits[currentFC.version-1]*100).toFixed(2)}%`} />
                                </td>

                                <td className="py-5 px-6">
                                    <CompareCell 
                                        hasValue={previewTicketMaps.has(keyOfSplit(mod))}
                                        isSame={currentTicketMaps.get(keyOfSplit(mod))?.percent?.eq(previewTicketMaps.get(keyOfSplit(mod))?.percent ?? 0)}
                                        valueGetter={() => `${(previewTicketMaps.get(keyOfSplit(mod))?.percent.toNumber()/JBConstants.TotalPercent.Splits[previewFC.version-1]*100).toFixed(2)}%`} />
                                </td>
                            </tr>
                        ))}
                    </>
                </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

function formattedSplit(percent: BigNumber, currency: BigNumber, target: BigNumber, fee: BigNumber, version: number) {
    const _totalPercent = JBConstants.TotalPercent.Splits[version-1];
    const _percent = percent.toNumber();

    if (target.eq(JBConstants.UintMax)) {
        return `${(_percent/_totalPercent*100).toFixed(2)}%`
    }

    const _amount = version == 1 ? amountSubFee(target, fee) : amountSubFeeV2(target, fee);
    return `${(_percent/_totalPercent*100).toFixed(2)}% (${formatCurrency(currency, _amount.mul(percent).div(_totalPercent))})`
}

function CompareCell({ valueGetter, hasValue = true, isSame = false }: { valueGetter: () => string, hasValue?: boolean, isSame?: boolean }) {
  return (
    <>
      {hasValue ? (
        isSame ? (
          <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
        ) : (
          <span>{valueGetter()}</span>
        )
      ) : (
        <MinusIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      )}
    </>
  )
}