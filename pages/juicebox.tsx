import { useRouter } from 'next/router';
import { amountSubFee } from "../libs/math";

import { BigNumber, utils } from 'ethers'
import { TerminalV1Contract } from "../libs/contractsV1";

import FormattedAddress from "../components/FormattedAddress";
import FormattedProject from "../components/FormattedProject";
import { useState } from "react";
import SiteNav from "../components/SiteNav";
import useCurrentFundingCycle from '../hooks/juicebox/CurrentFundingCycle';
import { useCurrentPayoutMods, useCurrentTicketMods } from '../hooks/juicebox/CurrentMods';
import { FundingCycleV1Args, parseV1Metadata, PayoutModV1, TicketModV1, V1FundingCycleMetadata } from '../models/JuiceboxTypes'
import { CheckIcon, MinusIcon } from '@heroicons/react/solid'
import unionBy from 'lodash.unionby'

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
    {name: 'Reconfiguration strategy', getFunc: (fc) => [fc.fundingCycle.ballot, <FormattedAddress address={fc.fundingCycle.ballot} />]},
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
  console.info('Parsed', {payouts, payoutMaps, tickets, ticketMaps});

  return (
    <div>
      <div className="mx-auto max-w-7xl bg-white py-16 sm:py-24 sm:px-6 lg:px-8">
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
                      <p className="mt-4 mb-16 text-sm text-gray-500">Quis suspendisse ut fermentum neque vivamus non tellus.</p>
                      <a
                        href='#'
                        className="5 absolute bottom-0 block w-full flex-grow rounded-md border border-gray-800 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900"
                      >
                        Load
                      </a>
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
                              <span>{map.get(`${mod.beneficiary}-${mod.projectId}-${mod.allocator}`).percent/100 + "%"} ({utils.formatEther(amountSubFee(arr[i].fundingCycle.target, arr[i].fundingCycle.fee).mul(mod.percent).div(10000))})</span>
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

              {/* {sections.map((section) => (
                <Fragment key={section.name}>
                  <tr>
                    <th
                      className="bg-gray-50 py-3 pl-6 text-left text-sm font-medium text-gray-900"
                      colSpan={4}
                      scope="colgroup"
                    >
                      {section.name}
                    </th>
                  </tr>
                  {section.features.map((feature) => (
                    <tr key={feature.name}>
                      <th className="py-5 px-6 text-left text-sm font-normal text-gray-500" scope="row">
                        {feature.name}
                      </th>
                      {tiers.map((tier) => (
                        <td key={tier.name} className="py-5 px-6">
                          {typeof feature.tiers[tier.name] === 'string' ? (
                            <span className="block text-sm text-gray-700">{feature.tiers[tier.name]}</span>
                          ) : (
                            <>
                              {feature.tiers[tier.name] === true ? (
                                <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                              ) : (
                                <MinusIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              )}

                              <span className="sr-only">
                                {feature.tiers[tier.name] === true ? 'Included' : 'Not included'} in {tier.name}
                              </span>
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))} */}
            </tbody>
            {/* <tfoot>
              <tr className="border-t border-gray-200">
                <th className="sr-only" scope="row">
                  Choose your plan
                </th>
                {tiers.map((tier) => (
                  <td key={tier.name} className="px-6 pt-5">
                    <a
                      href={tier.href}
                      className="block w-full rounded-md border border-gray-800 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900"
                    >
                      Buy {tier.name}
                    </a>
                  </td>
                ))}
              </tr>
            </tfoot> */}
          </table>
        </div>
      </div>
    </div>
  )
}

const formatter = new Intl.NumberFormat('en-GB', { style: "decimal" });
const formatNumber = (num) => formatter.format(num);
const formatCurrency = (currency, amount) => (currency.toNumber() == 0 ? "Ξ" : "$") + formatNumber(utils.formatEther(amount ?? 0));

function genOnEnter(elementId: string) {
    return (e: { keyCode: number; }) => {
        if(e.keyCode == 13) {
            document.getElementById(elementId).click();
        }
    }
}

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

export default function Juicebox() {
    // router
    const router = useRouter();
    const { project: projectParam } = router.query;
    let projectId = parseInt(projectParam as string);
    // default space
    if (!projectId) {
        projectId = 1;
    }
    // state
    const [previewArgs, setPreviewArgs] = useState(undefined);
    const [configs, setConfigs] = useState([]);

    // load current fc
    const { value: fc, loading: fcIsLoading } = useCurrentFundingCycle({projectId});
    const { value: payoutMods, loading: payoutModsIsLoading } = useCurrentPayoutMods(fc?.projectId, fc?.configured);
    const { value: ticketMods, loading: ticketModsIsLoading } = useCurrentTicketMods(fc?.projectId, fc?.configured);
    const metadata = parseV1Metadata(fc?.metadata);
    const currentConfig: FundingCycleConfigProps = {
      fundingCycle: fc,
      metadata,
      payoutMods,
      ticketMods
    };

    const loading = fcIsLoading || payoutModsIsLoading || ticketModsIsLoading;
    const dataIsEmpty = !fc || !payoutMods || !ticketMods

    const iface = new utils.Interface(TerminalV1Contract.contractInterface);
    const loadV1Reconfig = () => {
        const raw = (document.getElementById("v1-reconfig-input") as HTMLInputElement).value
        try {
          const ret = iface.parseTransaction({data: raw, value: 0});
          console.info("📗 TerminalV1.interface.parse >", {raw, args: ret.args, func: ret.signature, hash: ret.sighash});
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
          //router.push(`/juicebox?project=${ret.args._projectId.toNumber()}`, undefined, { shallow: true })
        } catch (e) {
          console.error('TerminalV1.interface.parse >', e);
        }
    }
    const loadProject = () => {
        setPreviewArgs(undefined);
        router.push('/juicebox?project=' + (document.getElementById("project-input") as HTMLInputElement).value, undefined, { shallow: true })
    }
    
    return (
        <>
          <SiteNav pageTitle="Juicebox Reconfiguration Helper" />
          <div className="bg-white">
            <div id="project-status" className="flex justify-center py-2">
                Current:&nbsp;<FormattedProject projectId={projectId} />
                {previewArgs && <span className="text-amber-300">(Compare Mode)</span>}
            </div>
            <div id="project-selector" className="flex justify-center gap-x-3 pt-2">
                <input type="number" min="1" className="rounded-xl pl-2" id="project-input" placeholder="Input project id here" onKeyDown={genOnEnter("load-project-btn")} />
                <button id="load-project-btn" onClick={loadProject} className="px-4 py-2 font-semibold text-sm bg-amber-200 hover:bg-amber-300 rounded-xl shadow-sm">Load V1 Project</button>
            </div>
            <div id="v1-reconfig-loader" className="flex justify-center gap-x-3 pt-2">
                <input type="text" className="rounded-xl pl-2" id="v1-reconfig-input" placeholder="Paste raw data here" onKeyDown={genOnEnter("load-v1-reconfig-btn")} />
                <button id="load-v1-reconfig-btn" onClick={loadV1Reconfig} className="px-4 py-2 font-semibold text-sm bg-amber-200 hover:bg-amber-300 rounded-xl shadow-sm">Load V1 Reconfig</button>
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