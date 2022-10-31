import { amountSubFee } from "../libs/math";

import { BigNumber, utils } from 'ethers'
import { TerminalV1Contract } from "../libs/contractsV1";

import FormattedAddress from "../components/FormattedAddress";
import FormattedProject from "../components/FormattedProject";
import { useEffect, useState } from "react";
import SiteNav from "../components/SiteNav";
import useCurrentFundingCycle from '../hooks/juicebox/CurrentFundingCycle';
import { useCurrentPayoutMods, useCurrentTicketMods } from '../hooks/juicebox/CurrentMods';
import { FundingCycleV1Args, parseV1Metadata, PayoutModV1, TicketModV1, V1FundingCycleMetadata } from '../models/JuiceboxTypes'
import { CheckIcon, MinusIcon } from '@heroicons/react/solid'
import unionBy from 'lodash.unionby'
import { NumberParam, useQueryParams, withDefault } from 'next-query-params';
import { SafeTransactionSelector, TxOption } from '../components/safe/SafeTransactionSelector';
import useProjectInfo from '../hooks/juicebox/ProjectInfo';
import ProjectSearch, { ProjectOption } from "../components/juicebox/ProjectSearch";
import ResolvedProject from "../components/ResolvedProject";

const jsonEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

interface FundingCycleConfigProps {
  fundingCycle: FundingCycleV1Args,
  metadata: V1FundingCycleMetadata,
  payoutMods: PayoutModV1[],
  ticketMods: TicketModV1[]
}

function Compare({arr}: {arr: FundingCycleConfigProps[]}) {
  const configFormatter: {
    name: string;
    getFunc: (fc: FundingCycleConfigProps) => any[];
  }[] = [
    {name: 'Discount rate', getFunc: (fc) => [fc.fundingCycle.discountRate.toNumber(), fc.fundingCycle.discountRate.toNumber() / 10 + "%"]},
    {name: 'Redemption rate', getFunc: (fc) => [fc.metadata.bondingCurveRate, fc.metadata.bondingCurveRate / 2 + "%"]},
    {name: 'Reserved rate', getFunc: (fc) => [fc.metadata.reservedRate, fc.metadata.reservedRate / 2 + "%"]},
    //{name: 'Contributor rate', getFunc: (fc) => parseInt(utils.formatEther(fc.fundingCycle.weight))/2},
    {name: 'Token minting', getFunc: (fc) => [fc.metadata.ticketPrintingIsAllowed, fc.metadata.ticketPrintingIsAllowed ? "Enabled" : "Disabled"]},
    {name: 'Payments', getFunc: (fc) => [fc.metadata.payIsPaused, fc.metadata.payIsPaused ? "Disabled" : "Enabled"]},
    {name: 'Reconfiguration strategy', getFunc: (fc) => [fc.fundingCycle.ballot, <FormattedAddress key={fc.fundingCycle.ballot} address={fc.fundingCycle.ballot} />]},
  ]

  // 'projectId-beneficiary-allocator': mod
  const convertPayoutToMap = (mods: PayoutModV1[]) => {
    const map = new Map<string, PayoutModV1>()
    for (const mod of mods) {
      const key = `${mod.beneficiary}-${mod.projectId}-${mod.allocator}`
      map.set(key, mod)
    }
    return map
  }
  // 'beneficiary': mod
  const convertTicketToMap = (mods: TicketModV1[]) => {
    const map = new Map<string, TicketModV1>()
    for (const mod of mods) {
      map.set(mod.beneficiary, mod)
    }
    return map
  }

  // Get the union of all the keys.
  const keyOfPayout = (mod: PayoutModV1) => `${mod.beneficiary}-${mod.projectId}-${mod.allocator}`;
  const payouts: PayoutModV1[] = unionBy(...arr.map((fc) => fc.payoutMods), keyOfPayout).sort(orderByPercent);
  const payoutMaps = arr.map((fc) => convertPayoutToMap(fc.payoutMods));
  const keyOfTicket = (mod: TicketModV1) => mod.beneficiary;
  const tickets: TicketModV1[] = unionBy(...arr.map((fc) => fc.ticketMods), keyOfTicket).sort(orderByPercent);
  const ticketMaps = arr.map((fc) => convertTicketToMap(fc.ticketMods));

  console.debug("Raw", arr, payoutMaps)

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
            <caption className="sr-only">Pricing plan comparison</caption>
            <thead>
              <tr>
                <th className="px-6 pb-4 text-left text-sm font-medium text-gray-900" scope="col">
                  <span className="sr-only">Feature by</span>
                  <span>Time</span>
                </th>
                {arr.map((fc, i) => (
                  <th
                    key={i}
                    className="w-1/4 px-6 pb-4 text-left text-lg font-medium leading-6 text-gray-900"
                    scope="col"
                  >
                    {i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-t border-gray-200">
              <tr>
                <th className="py-8 px-6 text-left align-top text-sm font-medium text-gray-900" scope="row">
                  Target
                </th>
                {arr.map((fc, i) => (
                  <td key={i} className="h-full py-8 px-6 align-top">
                    <div className="relative table h-full">
                      <p>
                        <span className="text-4xl font-bold tracking-tight text-gray-900">{formatCurrency(fc.fundingCycle.currency, fc.fundingCycle.target)}</span>{' '}
                        <span className="text-base font-medium text-gray-500">/{fc.fundingCycle.duration.toNumber()}&nbsp;days</span>
                      </p>
                    </div>
                  </td>
                ))}
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
                    {arr.map((fc, i) => (
                      <td key={i} className="py-5 px-6">
                          {(i>0 && config.getFunc(arr[0])[0] == config.getFunc(fc)[0]) ? (
                            <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                          ) : (
                            <span>{config.getFunc(fc)[1]}</span>
                          )}
                      </td>
                    ))}
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
                  <tr key={keyOfPayout(mod)}>
                    <th className="py-5 px-6 text-left text-sm font-normal text-gray-500" scope="row">
                      {mod.projectId.toNumber() != 0 && <FormattedProject projectId={mod.projectId.toNumber()} />}
                      <FormattedAddress address={mod.beneficiary} />:&nbsp;
                    </th>
                    {payoutMaps.map((map, i) => (
                      <td key={i} className="py-5 px-6">
                          {map.has(keyOfPayout(mod)) ? (
                            (i>0 && jsonEq(payoutMaps[0].get(keyOfPayout(mod)), map.get(keyOfPayout(mod)))) ? (
                              <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                            ) : (
                              <span>
                                {map.get(`${mod.beneficiary}-${mod.projectId}-${mod.allocator}`).percent/100 + "%"} ({parseInt(utils.formatEther(amountSubFee(arr[i].fundingCycle.target, arr[i].fundingCycle.fee).mul(map.get(`${mod.beneficiary}-${mod.projectId}-${mod.allocator}`).percent).div(10000)))})
                              </span>
                            )
                          ) : (
                            <MinusIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          )}
                      </td>
                    ))}
                  </tr>
                ))}
              </>

              {/* Ticket */}
              <>
                <tr>
                  <th
                    className="bg-gray-50 py-3 pl-6 text-left text-sm font-medium text-gray-900"
                    colSpan={3}
                    scope="colgroup"
                  >
                    Reserved tokens
                  </th>
                </tr>
                {tickets.map((mod) => (
                  <tr key={keyOfTicket(mod)}>
                    <th className="py-5 px-6 text-left text-sm font-normal text-gray-500" scope="row">
                      <FormattedAddress address={mod.beneficiary} />:&nbsp;
                    </th>
                    {ticketMaps.map((map, i) => (
                      <td key={i} className="py-5 px-6">
                          {map.has(keyOfTicket(mod)) ? (
                            (i>0 && jsonEq(ticketMaps[0].get(keyOfTicket(mod)), map.get(keyOfTicket(mod)))) ? (
                              <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                            ) : (
                              <span>{mod.percent/100 + "%"}</span>
                            )
                          ) : (
                            <MinusIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          )}
                      </td>
                    ))}
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

const formatter = new Intl.NumberFormat('en-GB', { style: "decimal" });
const formatNumber = (num) => formatter.format(num);
const formatCurrency = (currency, amount) => (currency.toNumber() == 0 ? "Ξ" : "$") + formatNumber(utils.formatEther(amount ?? 0));

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

export default function JuiceboxPage() {
    // router
    const [query, setQuery] = useQueryParams({ 
      project: withDefault(NumberParam, 1), 
      version: withDefault(NumberParam, 1) 
    });
    const project = query.project;
    const version = query.version;
    // state
    const [previewArgs, setPreviewArgs] = useState(undefined);
    const [configs, setConfigs] = useState([]);
    const [rawData, setRawData] = useState<string>(undefined);
    const [selectedSafeTx, setSelectedSafeTx] = useState<TxOption>(undefined)

    // external hooks
    const { value: fc, loading: fcIsLoading } = useCurrentFundingCycle({projectId: project});
    const { data: projectInfo, loading: infoIsLoading } = useProjectInfo(1, project);
    const { value: payoutMods, loading: payoutModsIsLoading } = useCurrentPayoutMods(fc?.projectId, fc?.configured);
    const { value: ticketMods, loading: ticketModsIsLoading } = useCurrentTicketMods(fc?.projectId, fc?.configured);
    const metadata = parseV1Metadata(fc?.metadata);
    const currentConfig: FundingCycleConfigProps = {
      fundingCycle: fc,
      metadata,
      payoutMods,
      ticketMods
    };

    const owner = projectInfo?.owner ? utils.getAddress(projectInfo.owner) : undefined;
    const loading = fcIsLoading || payoutModsIsLoading || ticketModsIsLoading;
    const dataIsEmpty = !fc || !payoutMods || !ticketMods

    const iface = new utils.Interface(TerminalV1Contract.contractInterface);
    const loadV1Reconfig = () => {
        const raw = rawData;
        try {
          const ret = iface.parseTransaction({data: raw, value: 0});
          setPreviewArgs(ret.args);
          // FIXME: detect illegal raw data
          const {
            _projectId,
            _properties,
            _metadata,
            _payoutMods,
            _ticketMods
          }: {
            _projectId: BigNumber,
            _properties: Omit<FundingCycleV1Args, "projectId" | "fee">,
            _metadata: V1FundingCycleMetadata,
            _payoutMods: PayoutModV1[],
            _ticketMods: TicketModV1[],
          } = ret.args as any;
          const newConfig: FundingCycleConfigProps = {
            fundingCycle: {..._properties, projectId: _projectId, fee: fc?.fee},
            metadata: _metadata,
            payoutMods: _payoutMods,
            ticketMods: _ticketMods
          };
          setConfigs([currentConfig, newConfig]);
        } catch (e) {
          console.warn('TerminalV1.interface.parse >', e);
        }
    }

    const setSafeTx = (option: TxOption) => {
      setSelectedSafeTx(option);
      setRawData(option.tx.data);
    }
    const onProjectOptionSet = (option: ProjectOption) => {
      setQuery({
        project: option.projectId, 
        version: parseInt(option.version[0] ?? "1")
      });
    }

    useEffect(() => {
      loadV1Reconfig();
    }, [rawData]);
    
    return (
        <>
          <SiteNav pageTitle="Juicebox Reconfiguration Helper" />
          <div className="bg-white">
            <div id="project-status" className="flex justify-center py-2 mx-6">
                <ResolvedProject projectId={project} version={version} />
            </div>
            <div id="project-selector" className="flex justify-center gap-x-3 pt-2 mx-6">
              <ProjectSearch onProjectOptionSet={onProjectOptionSet} label="Seach project by handle" />
            </div>
            <div id="safetx-loader" className="flex justify-center pt-2 mx-6">
                <div className="w-1/3">
                  <SafeTransactionSelector val={selectedSafeTx} setVal={setSafeTx} safeAddress={owner} shouldRun={owner !== undefined} />
                </div>
                
                {/* <textarea rows={3} className="w-full rounded-xl" id="raw-data" placeholder="Paste raw data here" value={rawData} onChange={(e) => setRawData(e.target.value)} /> */}
            </div>
            <br />
            {(loading || dataIsEmpty)
                ? <div className="text-center">Loading...</div>
                : <Compare arr={configs.length > 0 ? configs : [currentConfig]} />
            }
          </div>
        </>
    )
}