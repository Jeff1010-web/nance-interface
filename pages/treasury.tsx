import { Switch } from "@headlessui/react";
import { BigNumber, constants } from "ethers";
import { commify } from "ethers/lib/utils";
import { BooleanParam, useQueryParam, withDefault } from "next-query-params";
import FormattedAddress from "../components/FormattedAddress";
import ResolvedProject from "../components/ResolvedProject";
import SiteNav from "../components/SiteNav"
import { useCurrentFundingCycleV2 } from "../hooks/juicebox/CurrentFundingCycle";
import { useCurrentSplits } from "../hooks/juicebox/CurrentSplits";
import { useDistributionLimit } from "../hooks/juicebox/DistributionLimit";
import { useTerminalBalance, useTerminalBalanceV1 } from "../hooks/juicebox/TerminalBalance"
import useTerminalFee from "../hooks/juicebox/TerminalFee";
import { useTokenBalanceOfProject, useTotalSupplyOfProject } from "../hooks/juicebox/TotalSupplyOfProject";
import { useTokenUsdPrice } from "../hooks/PriceHook";
import { useMultisigAssets } from "../hooks/SafeHooks";
import { JBConstants, JBSplit } from "../models/JuiceboxTypes";
import Footer from "../components/Footer";

function formatUSD(usd: number) {
  return usd ? '$' + commify(usd.toFixed(2)) : '$0';
}

function keyOfSplit(mod: JBSplit) {
  return `${mod.beneficiary}-${mod.projectId}-${mod.allocator}`;
}

function usdOfSplit(percent: BigNumber, target: BigNumber, fee: BigNumber) {
  if (!percent || !target || !fee) return undefined;

  const _totalPercent = JBConstants.TotalPercent.Splits[2];
  const _percent = percent.toNumber();

  // if (target.eq(JBConstants.UintMax)) {
  //     return `${(_percent/_totalPercent*100).toFixed(2)}%`
  // }

  const amount = target.mul(percent).div(_totalPercent);
  return amount.gte(JBConstants.UintMax) ? -1 : amount.div(constants.WeiPerEther).toNumber();
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const JBDAO_SAFE = "0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e"

export default function TreasuryPage() {
  // state
  const [excludeJBX, setExcludeJBX] = useQueryParam("excludeJBX", withDefault(BooleanParam, true));

  // read project balance from JBETHTerminal
  const { data: _jbxPrice, isLoading: jbxPriceLoading } = useTokenUsdPrice("JBX", !excludeJBX)
  const { value: v1ETHBalance, loading: v1ETHBalanceLoading } = useTerminalBalanceV1({ projectId: 1 });
  const { value: v2ETHBalance, loading: v2ETHBalanceLoading } = useTerminalBalance({ projectId: 1, isV2: true });
  const { value: v3ETHBalance, loading: v3ETHBalanceLoading } = useTerminalBalance({ projectId: 1 });
  const { data: safeAssets, isLoading: safeAssetsLoading } = useMultisigAssets(JBDAO_SAFE);
  
  const ethPrice = parseFloat(safeAssets?.find((o) => o.token === null).fiatConversion || "0")
  const jbxPrice = _jbxPrice || 0

  console.debug("TreasuryPage.stats", {
    v1: v1ETHBalance?.div(constants.WeiPerEther).toNumber(),
    v2: v2ETHBalance?.div(constants.WeiPerEther).toNumber(),
    v3: v3ETHBalance?.div(constants.WeiPerEther).toNumber(),
    ethPrice, jbxPrice
  })

  // get all current payouts
  const { value: _fc, loading: fcIsLoading } = useCurrentFundingCycleV2({ projectId: 1, isV3: true });
  const [fc, metadata] = _fc || [];
  const { value: fee, loading: feeIsLoading } = useTerminalFee({ version: "3" });
  const { value: _limit, loading: targetIsLoading } = useDistributionLimit(1, fc?.configuration, true);
  const [target, currency] = _limit || [];
  const { value: payoutMods, loading: payoutModsIsLoading } = useCurrentSplits(1, fc?.configuration, JBConstants.SplitGroup.ETH, true);

  // get all JBX supply in v1&v2&v3
  const { value: v1JBXSupply, loading: v1JBXSupplyIsLoading } = useTotalSupplyOfProject({ projectId: 1, version: 1 });
  const { value: v2JBXSupply, loading: v2JBXSupplyIsLoading } = useTotalSupplyOfProject({ projectId: 1, version: 2 });
  const { value: v3JBXSupply, loading: v3JBXSupplyIsLoading } = useTotalSupplyOfProject({ projectId: 1, version: 3 });
  // get v1 JBX balance
  const { value: v1JBXBalance, loading: v1JBXBalanceIsLoading } = useTokenBalanceOfProject({ holder: excludeJBX ? undefined : JBDAO_SAFE, projectId: 1, version: 1 });

  const loading = jbxPriceLoading || v1ETHBalanceLoading || v2ETHBalanceLoading || v3ETHBalanceLoading || safeAssetsLoading;
  const _ethInProjects = (loading ? 0 : v1ETHBalance?.add(v2ETHBalance).add(v3ETHBalance).div(constants.WeiPerEther).toNumber()) || 0;
  const _jbxInProjects = (loading ? 0 : v1JBXBalance?.div(constants.WeiPerEther).toNumber()) || 0;
  const usdInProjects = _ethInProjects * ethPrice;

  const assets: Entry[] = safeAssets?.map(asset => ({ key: asset.token?.symbol || 'ETH', val: parseFloat(asset.fiatBalance) })).sort((a, b) => b.val - a.val) || [];
  // add ethInProjects in addition to safe assets
  if (assets.find(a => a.key === 'ETH')) {
    assets.find(a => a.key === 'ETH').val += usdInProjects;
  } else {
    assets.push({ key: 'ETH', val: usdInProjects })
  }
  // add jbxInProjects in addition to safe assets
  if (assets.find(a => a.key === 'JBX')) {
    if (excludeJBX) {
      assets.find(a => a.key === 'JBX').val = 0;
    } else {
      assets.find(a => a.key === 'JBX').val += _jbxInProjects * jbxPrice;
    }
  } else if (!excludeJBX) {
    assets.push({ key: 'JBX', val: _jbxInProjects * jbxPrice })
  }

  const usdInTotal = assets?.filter(asset => !excludeJBX || asset.key !== 'JBX').reduce((acc, asset) => acc + asset.val, 0) || 0;

  const payouts: Entry[] = payoutMods?.map(mod => ({ key: mod, val: usdOfSplit(mod.percent, target, fee) })).sort((a, b) => b.val - a.val) || [];
  const usdInPayouts = target?.div(constants.WeiPerEther).toNumber() || 0;
  const supplies: Entry[] = [
    { key: 'v1', val: v1JBXSupply?.div(constants.WeiPerEther).toNumber() || 0 },
    { key: 'v2', val: v2JBXSupply?.div(constants.WeiPerEther).toNumber() || 0 },
    { key: 'v3', val: v3JBXSupply?.div(constants.WeiPerEther).toNumber() || 0 },
  ].sort((a, b) => b.val - a.val);

  const net = usdInTotal - usdInPayouts;

  return (
    <>
      <SiteNav pageTitle={"JuiceboxDAO Treasury Stats"} />

      <div className="m-12">
        <div className="flex justify-between">
          <h1 className="text-lg font-bold leading-6 text-gray-900">JuiceboxDAO Treasury Stats</h1>

          <Switch.Group as="div" className="flex items-center">
            <Switch
              checked={excludeJBX}
              onChange={setExcludeJBX}
              className={classNames(
                excludeJBX ? 'bg-indigo-600' : 'bg-gray-200',
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              )}
            >
              <span
                aria-hidden="true"
                className={classNames(
                  excludeJBX ? 'translate-x-5' : 'translate-x-0',
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                )}
              />
            </Switch>
            <Switch.Label as="span" className="ml-3">
              <span className="text-sm font-medium text-gray-900">Exclude JBX in Assets</span>
            </Switch.Label>
          </Switch.Group>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-12 md:gap-5 md:grid-cols-3">

          <div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Net</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{formatUSD(net)}</dd>
            </div>

            <Entries title="Runway" keyTitle="Name" valTitle="Cycles" entries={[{ key: "This Cycle Runway", val: net / usdInPayouts }]} valRender={(v) => v.toFixed(0)} />
          </div>

          <div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Total Assets</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{formatUSD(usdInTotal)}</dd>
            </div>

            <Entries title="Assets" keyTitle="Token" entries={assets} />
          </div>

          <div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Total Liabilities</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{formatUSD(usdInPayouts)}</dd>
            </div>

            <Entries title="Liabilities" keyTitle="Name" entries={[{ key: "Current Bi-weekly Payouts", val: usdInPayouts }]} />
          </div>

          <div className="md:col-span-2">
            <Entries title="Payouts" keyTitle="Account" entries={payouts} keyRender={(k) => [keyOfSplit(k), <PayoutSplitName key={keyOfSplit(k)} mod={k} />]} />
          </div>

          <div className="col-span-1">
            <Entries title="JBX Supply" keyTitle="Version" valTitle="Balance" entries={supplies} valRender={(v) => commify(Math.floor(v))} />
          </div>
        </dl>

      </div>

      <Footer />
    </>

  )
}

interface Entry {
  key: any
  val: number
}

function Entries({
  title, keyTitle, valTitle = "USD", entries,
  keyRender = (k) => [k, k], valRender = (v) => formatUSD(v)
}: {
  title: string, keyTitle: string, valTitle?: string, entries: Entry[],
  keyRender?: (key: any) => [string, JSX.Element | string], valRender?: (val: number) => string
}) {
  return (
    <div className="mt-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h3 className="text-xl text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="mt-3 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      {keyTitle}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      {valTitle}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {entries.map((entry) => (
                    <tr key={keyRender(entry.key)[0]}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {keyRender(entry.key)[1]}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{valRender(entry.val)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PayoutSplitName({ mod }: { mod: JBSplit }) {
  let splitMode = "address";
  if (mod.allocator !== "0x0000000000000000000000000000000000000000") splitMode = "allocator";
  else if (mod.projectId.toNumber() !== 0) splitMode = "project";

  const mainStyle = "text-sm";
  const subStyle = "text-xs italic";
  const projectVersion = 3;

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
          {mod.beneficiary !== "0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e" && <FormattedAddress address={mod.beneficiary} style={subStyle} />}
        </>
      )}

      {/* Address mode */}
      {splitMode === "address" && (
        <>
          <FormattedAddress address={mod.beneficiary} style={mainStyle} />
        </>
      )}
    </>
  )
}
