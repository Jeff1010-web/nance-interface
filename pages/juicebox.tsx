import { BigNumber, utils } from 'ethers'
import { TerminalV1Contract } from "../libs/contractsV1";
import JBETHPaymentTerminal from '@jbx-protocol/contracts-v2/deployments/mainnet/JBETHPaymentTerminal.json';
import JBControllerV2 from '@jbx-protocol/contracts-v2/deployments/mainnet/JBController.json';

import { useEffect, useState } from "react";
import SiteNav from "../components/SiteNav";
import useCurrentFundingCycle, { useCurrentFundingCycleV2 } from '../hooks/juicebox/CurrentFundingCycle';
import { useCurrentPayoutMods, useCurrentTicketMods } from '../hooks/juicebox/CurrentMods';
import { JBConstants, JBFundAccessConstraints, JBGroupedSplits, parseV1Metadata, payoutMod2Split, PayoutModV1, ticketMod2Split, TicketModV1, V1FundingCycleMetadata, V2FundingCycleMetadata, V2V3FundingCycleData } from '../models/JuiceboxTypes'
import { NumberParam, useQueryParams, withDefault } from 'next-query-params';
import { SafeTransactionSelector, TxOption } from '../components/safe/SafeTransactionSelector';
import useProjectInfo from '../hooks/juicebox/ProjectInfo';
import ProjectSearch, { ProjectOption } from "../components/juicebox/ProjectSearch";
import ResolvedProject from "../components/ResolvedProject";
import ReconfigurationCompare, { FundingCycleArgs, FundingCycleConfigProps, MetadataArgs } from '../components/juicebox/ReconfigurationCompare';
import { useCurrentSplits } from '../hooks/juicebox/CurrentSplits';
import { useDistributionLimit } from '../hooks/juicebox/DistributionLimit';
import useTerminalFee from '../hooks/juicebox/TerminalFee';
import { useReconfigureRequest } from '../hooks/NanceHooks';
import { getUnixTime } from 'date-fns';

function v1metadata2args(m: V1FundingCycleMetadata): MetadataArgs {
  if (!m) return undefined;
  return {
    redemptionRate: BigNumber.from(m.bondingCurveRate),
    reservedRate: BigNumber.from(m.reservedRate),
    pausePay: m.payIsPaused,
    allowMinting: m.ticketPrintingIsAllowed,
    allowTerminalMigration: false,
    allowControllerMigration: false
  }
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
    const [selectedSafeTx, setSelectedSafeTx] = useState<TxOption>(undefined);
    // FIXME remove me on endpoint and here
    const [currentTime, setCurrentTime] = useState<string>(undefined);

    // external hooks
    const { data: projectInfo, loading: infoIsLoading } = useProjectInfo(1, project);
    const owner = projectInfo?.owner ? utils.getAddress(projectInfo.owner) : undefined;
    const { data: reconfig, isLoading: reconfigLoading, error: reconfigError } = useReconfigureRequest({
        space: "juicebox",
        version: `V${version}`,
        address: owner || '0x0000000000000000000000000000000000000000',
        datetime: currentTime,
        network: 'mainnet'
    }, currentTime !== undefined && project === 1);
    const rawData = reconfig?.data.transaction.bytes

    const onProjectOptionSet = (option: ProjectOption) => {
      setQuery({
        project: option.projectId, 
        version: parseInt(option.version[0] ?? "1")
      });
    }

    useEffect(() => {
        setCurrentTime(new Date().toISOString())
    }, [projectInfo, owner])
    
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
                  <SafeTransactionSelector val={selectedSafeTx} setVal={setSelectedSafeTx} safeAddress={owner} shouldRun={owner !== undefined} />
                </div>

                {project === 1 && (
                  <button
                    disabled={rawData === undefined || selectedSafeTx === undefined}
                    className="ml-3 flex content-center justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
                    onClick={() => setSelectedSafeTx(undefined)}
                  >{reconfigLoading ? "Nance loading..." 
                      : selectedSafeTx === undefined ? "Nance loaded"
                      : "Use nance"}</button>
                )}
                
                {/* <textarea rows={3} className="w-full rounded-xl" id="raw-data" placeholder="Paste raw data here" value={rawData} onChange={(e) => setRawData(e.target.value)} /> */}
            </div>
            <br />
            {version == 1 && <V1Compare projectId={project} tx={selectedSafeTx} rawData={rawData} />}
            {version == 2 && <V2Compare projectId={project} tx={selectedSafeTx} rawData={rawData} />}
          </div>
        </>
    )
}

function V1Compare({ projectId, tx, rawData }: { projectId: number, tx?: TxOption, rawData?: string }) {
  // state
  const [previewConfig, setPreviewConfig] = useState<FundingCycleConfigProps>(undefined);

  // for compare
  const { value: fc, loading: fcIsLoading } = useCurrentFundingCycle({projectId});
  const { value: payoutMods, loading: payoutModsIsLoading } = useCurrentPayoutMods(projectId, fc?.configured);
  const { value: ticketMods, loading: ticketModsIsLoading } = useCurrentTicketMods(projectId, fc?.configured);
  const metadata = parseV1Metadata(fc?.metadata);
  const currentConfig: FundingCycleConfigProps = {
    version: 1,
    fundingCycle: {
      ...fc,
      configuration: fc?.configured
    },
    metadata: v1metadata2args(metadata),
    payoutMods: payoutMods?.map(payoutMod2Split),
    ticketMods: ticketMods?.map(ticketMod2Split),
  };

  const loading = fcIsLoading || payoutModsIsLoading || ticketModsIsLoading;
  const dataIsEmpty = !fc || !payoutMods || !ticketMods

  useEffect(() => {
    const iface = new utils.Interface(TerminalV1Contract.contractInterface);
    const raw = tx?.tx.data || rawData;
    try {
      const ret = iface.parseTransaction({data: raw, value: 0});
      // FIXME: detect illegal raw data
      const {
        _projectId,
        _properties,
        _metadata,
        _payoutMods,
        _ticketMods
      }: {
        _projectId: BigNumber,
        _properties: Omit<FundingCycleArgs, "fee" | "configuration">,
        _metadata: V1FundingCycleMetadata,
        _payoutMods: PayoutModV1[],
        _ticketMods: TicketModV1[],
      } = ret.args as any;
      const txDate = getUnixTime(new Date(tx?.tx.submissionDate)) || getUnixTime(new Date());
      const newConfig: FundingCycleConfigProps = {
        version: 1,
        fundingCycle: {
          ..._properties, 
          fee: fc?.fee, 
          configuration: txDate ? BigNumber.from(txDate) : fc?.configured
        },
        metadata: v1metadata2args(_metadata),
        payoutMods: _payoutMods.map(payoutMod2Split),
        ticketMods: _ticketMods.map(ticketMod2Split)
      };
      setPreviewConfig(newConfig);
    } catch (e) {
      console.debug('TerminalV1.interface.parse >', e);
    }
  }, [tx, fc, rawData]);

  return (
    (loading || dataIsEmpty)
      ? <div className="text-center">Loading...</div>
      : <ReconfigurationCompare currentFC={currentConfig} previewFC={previewConfig || currentConfig} />
  )
}

function V2Compare({ projectId, tx, rawData }: { projectId: number, tx?: TxOption, rawData?: string }) {
  // state
  const [previewConfig, setPreviewConfig] = useState<FundingCycleConfigProps>(undefined);

  // for compare
  const { value: _fc, loading: fcIsLoading } = useCurrentFundingCycleV2({projectId});
  const [fc, metadata] = _fc || [];
  const { value: fee, loading: feeIsLoading } = useTerminalFee({ version: "2" });
  const { value: _limit, loading: targetIsLoading } = useDistributionLimit(projectId, fc?.configuration);
  const [target, currency] = _limit || [];
  const { value: payoutMods, loading: payoutModsIsLoading } = useCurrentSplits(projectId, fc?.configuration, JBConstants.SplitGroup.ETH);
  const { value: ticketMods, loading: ticketModsIsLoading } = useCurrentSplits(projectId, fc?.configuration, JBConstants.SplitGroup.RESERVED_TOKEN);
  //const metadata = parseV1Metadata(fc?.metadata);
  const currentConfig: FundingCycleConfigProps = {
    version: 2,
    fundingCycle: {
      ...fc,
      fee,
      currency: currency?.sub(1),
      target,
      configuration: fc?.configuration
    },
    metadata,
    payoutMods,
    ticketMods,
  };

  const loading = fcIsLoading || feeIsLoading || targetIsLoading || payoutModsIsLoading || ticketModsIsLoading;
  const dataIsEmpty = !fc || !payoutMods || !ticketMods

  useEffect(() => {
    const iface = new utils.Interface(JBControllerV2.abi);
    const raw = tx?.tx.data || rawData;
    try {
      const ret = iface.parseTransaction({data: raw, value: 0});
      // FIXME: detect illegal raw data
      const {
        _data,
        _metadata,
        _groupedSplits,
        _fundAccessConstraints
      }: {
        _data: V2V3FundingCycleData,
        _metadata: V2FundingCycleMetadata,
        _groupedSplits: JBGroupedSplits[],
        _fundAccessConstraints: JBFundAccessConstraints[]
      } = ret.args as any;
      const fac = _fundAccessConstraints.find(c => c.terminal == JBETHPaymentTerminal.address);
      const txDate = getUnixTime(new Date(tx?.tx.submissionDate)) || getUnixTime(new Date());
      const newConfig: FundingCycleConfigProps = {
        version: 2,
        fundingCycle: {
          ..._data, 
          fee,
          configuration: txDate ? BigNumber.from(txDate) : fc?.configuration,
          currency: fac?.distributionLimitCurrency.sub(1),
          target: fac?.distributionLimit
        },
        metadata: _metadata,
        payoutMods: _groupedSplits.find(s => s.group.toNumber() == JBConstants.SplitGroup.ETH)?.splits,
        ticketMods: _groupedSplits.find(s => s.group.toNumber() == JBConstants.SplitGroup.RESERVED_TOKEN)?.splits
      };
      setPreviewConfig(newConfig);
    } catch (e) {
      console.debug('JBETHPaymentTerminal.interface.parse >', e);
    }
  }, [tx, fc, rawData])

  return (
    (loading || dataIsEmpty)
      ? <div className="text-center">Loading...</div>
      : <ReconfigurationCompare currentFC={currentConfig} previewFC={previewConfig || currentConfig} />
  )
}