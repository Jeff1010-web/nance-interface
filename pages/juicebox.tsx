import { BigNumber, utils } from 'ethers'
import { useEffect, useState } from "react";
import SiteNav from "../components/SiteNav";
import useCurrentFundingCycle, { useCurrentFundingCycleV2 } from '../hooks/juicebox/CurrentFundingCycle';
import { useCurrentPayoutMods, useCurrentTicketMods } from '../hooks/juicebox/CurrentMods';
import { JBConstants, parseV1Metadata, payoutMod2Split, ticketMod2Split, V1FundingCycleMetadata } from '../models/JuiceboxTypes'
import { NumberParam, StringParam, useQueryParams, withDefault } from 'next-query-params';
import { AddressMap, SafeTransactionSelector, TxOption } from '../components/safe/SafeTransactionSelector';
import useProjectInfo from '../hooks/juicebox/ProjectInfo';
import ProjectSearch, { ProjectOption } from "../components/juicebox/ProjectSearch";
import ResolvedProject from "../components/ResolvedProject";
import ReconfigurationCompare, { FundingCycleConfigProps, MetadataArgs } from '../components/juicebox/ReconfigurationCompare';
import { useCurrentSplits } from '../hooks/juicebox/CurrentSplits';
import { useDistributionLimit } from '../hooks/juicebox/DistributionLimit';
import useTerminalFee from '../hooks/juicebox/TerminalFee';
import { useReconfigureRequest } from '../hooks/NanceHooks';
import { useAccount, useSigner } from 'wagmi';
import { JsonRpcSigner } from "@ethersproject/providers";
import { GnosisHandler } from '../libs/gnosis';
import { QueueSafeTransaction, SafeMultisigTransaction } from '../models/SafeTypes';
import parseSafeJuiceboxTx, { getVersionOfTx } from '../libs/SafeJuiceboxParser';
import Tabs from '../components/Tabs';
import { useMultisigTransactionOf } from '../hooks/SafeHooks';
import { Switch } from '@headlessui/react';
import fetchMetadata, { consolidateMetadata, ProjectMetadataV4 } from '../libs/projectMetadata';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

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

const TABS = ["Multisig", "Bookkeeper"]

const CONTRACT_MAP: AddressMap = {
  "0xFFdD70C318915879d5192e8a0dcbFcB0285b3C98": "JBController_V3",
  "0x4e3ef8AFCC2B52E4e704f4c8d9B7E7948F651351": "JBController_V2",
  "0x7Ae63FBa045Fec7CaE1a75cF7Aa14183483b8397": "JBETHPaymentTerminal_V2",
  "0xd569D3CCE55b71a8a3f3C418c329A66e5f714431": "TerminalV1",
  "0xB9E4B658298C7A36BdF4C2832042A5D6700c3Ab8": "ModStore"
}

export default function JuiceboxPage() {
  // router
  const [query, setQuery] = useQueryParams({
    project: withDefault(NumberParam, 1),
    version: withDefault(NumberParam, 3),
    role: withDefault(StringParam, "Multisig"),
    safeTxHash: withDefault(StringParam, "")
  });
  const project = query.project;
  const version = query.version;
  const role = query.role;
  // state
  const [selectedSafeTx, setSelectedSafeTx] = useState<TxOption>(undefined);
  const [metadata, setMetadata] = useState<ProjectMetadataV4>(undefined);
  // FIXME remove me on endpoint and here
  const [currentTime, setCurrentTime] = useState<string>(undefined);

  // external hooks
  const { data: projectInfo, loading: infoIsLoading } = useProjectInfo(version, project);
  const owner = projectInfo?.owner ? utils.getAddress(projectInfo.owner) : undefined;
  const { data: specifiedSafeTx } = useMultisigTransactionOf(owner, query.safeTxHash, query.safeTxHash !== "");

  const setSelectedTxOption = (tx: TxOption) => {
    setSelectedSafeTx(tx);
    setQuery({ safeTxHash: tx?.tx?.safeTxHash });
  }

  // nance
  const { address } = useAccount();
  const { data: signer, isError, isLoading: signerLoading } = useSigner()
  const jrpcSigner = signer as JsonRpcSigner;
  const { data: reconfig, isLoading: reconfigLoading, error: reconfigError } = useReconfigureRequest({
    space: "juicebox",
    version: `V${version}`,
    address: address || '0x0000000000000000000000000000000000000000',
    datetime: currentTime,
    network: 'mainnet'
  }, currentTime !== undefined && project === 1);
  const reconfigData = reconfig?.data

  // this will override selectedSafeTx from options
  const rawData = reconfig?.data?.transaction?.bytes
  let _txForComponent = selectedSafeTx?.tx
  if (role === "Multisig" && specifiedSafeTx?.results?.[0]) {
    _txForComponent = selectedSafeTx?.tx || specifiedSafeTx?.results?.[0]
  }

  // nance post safe transaction
  const [nonce, setNonce] = useState<string>(undefined);
  const [error, setError] = useState<string>(undefined)
  const [gnosisLoading, setGnosisLoading] = useState(false)
  const [gnosisResponse, setGnosisResponse] = useState({ success: undefined, data: undefined })
  const postTransaction = async () => {
    setGnosisLoading(true);
    const gnosis = new GnosisHandler(owner, 'mainnet');
    const txnPartial = {
      to: reconfigData?.transaction?.address,
      value: 0,
      data: reconfigData?.transaction?.bytes,
      nonce: nonce || reconfigData?.nonce
    };
    const { safeTxGas } = await gnosis.getEstimate(txnPartial);
    const { message, transactionHash } = await gnosis.getGnosisMessageToSign(safeTxGas, txnPartial);
    const signature = await signer.signMessage(message).then((sig) => {
      return sig.replace(/1b$/, '1f').replace(/1c$/, '20')
    }).catch(() => {
      setGnosisLoading(false)
      setError('signature rejected');
      return 'signature rejected'
    })
    if (signature === 'signature rejected') { return }
    const txn: QueueSafeTransaction = {
      ...txnPartial,
      address,
      safeTxGas,
      transactionHash,
      signature
    };
    const res = await gnosis.queueTransaction(txn)
    setGnosisLoading(false);
    setGnosisResponse(res)
  }

  const onProjectOptionSet = (option: ProjectOption) => {
    setQuery({
      project: option.projectId,
      version: parseInt(option.version[0] ?? "1")
    });
  }

  useEffect(() => {
    setCurrentTime(new Date().toISOString())
  }, [projectInfo, owner])

  useEffect(() => {
    if (projectInfo?.metadataUri) {
      fetchMetadata(projectInfo.metadataUri)
        .then((metadata) => {
          setMetadata(consolidateMetadata(metadata));
        })
        .catch(e => {
          console.error('📗 Juicebox.loadMetadata >', { e });
        })
    }

    // cleanup
    return () => {
      setMetadata(undefined);
    }
  }, [projectInfo]);

  const notSupportedByNance = project !== 1 && role === "Bookkeeper";

  return (
    <>
      <SiteNav pageTitle="Juicebox Reconfiguration Helper" withWallet />
      <Tabs tabs={TABS} currentTab={role} setCurrentTab={(tab) => setQuery({ role: tab })} />
      <div className="bg-white">
        <div id="project-info" className="flex flex-col items-center py-2 mx-6">
          <img className="mx-auto h-32 w-32 flex-shrink-0 rounded-full" src={metadata?.logoUri || '/images/juiceboxdao_logo.gif'} alt="project logo" />
          <p className="text-base font-medium text-gray-900">{metadata?.name || `Untitled Project (${project})`}</p>
          <dd className="text-gray-700 break-words line-clamp-3 w-1/3">{metadata?.description || 'Loading metadata...'}</dd>
          <ResolvedProject projectId={project} version={version} />
        </div>

        <div id="project-selector" className="flex justify-center gap-x-3 pt-2 mx-6">
          <ProjectSearch onProjectOptionSet={onProjectOptionSet} label="Seach project by handle" />
        </div>
        <div id="safetx-loader" className="flex justify-center pt-2 mx-6">
          {role === "Multisig" && (
            <div className="w-1/2">
              <SafeTransactionSelector val={selectedSafeTx} setVal={setSelectedTxOption} safeAddress={owner} shouldRun={owner !== undefined} addressMap={CONTRACT_MAP} />
            </div>
          )}

          {project !== 1 && role === "Bookkeeper" && (
            <div className="">
              <span>Not supported by Nance, you can reach out on <a href="https://discord.com/channels/775859454780244028/955977240787685416" className="underline">Discord</a></span>
            </div>
          )}

          {project === 1 && role === "Bookkeeper" && (
            <div className="w-1/4 space-y-2">
              <button
                disabled={rawData === undefined || selectedSafeTx === undefined}
                className="ml-3 inline-flex content-center justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
                onClick={() => setSelectedSafeTx(undefined)}
              >
                {reconfigLoading ?
                  "Nance loading..."
                  : selectedSafeTx === undefined ?
                    rawData !== undefined ? "Nance loaded" : "Nance error"
                    : "Use nance"}
              </button>

              <div className="flex space-x-2">
                <button
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
                  disabled={!jrpcSigner || !rawData}
                  onClick={postTransaction}
                >{(gnosisLoading) ? 'Signing...' : 'Queue'}</button>
                <input
                  type="number"
                  placeholder="custom nonce"
                  defaultValue={reconfigData?.nonce}
                  onChange={(e) => setNonce(e.target.value)}
                  className="inline-flex rounded rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* <textarea rows={3} className="w-full rounded-xl" id="raw-data" placeholder="Paste raw data here" value={rawData} onChange={(e) => setRawData(e.target.value)} /> */}
        </div>
        <br />

        {version == 1 && !notSupportedByNance && <V1Compare projectId={project} tx={_txForComponent} rawData={rawData} />}
        {version == 2 && !notSupportedByNance && <V2Compare projectId={project} tx={_txForComponent} rawData={rawData} />}
        {version == 3 && !notSupportedByNance && <V3Compare projectId={project} tx={_txForComponent} rawData={rawData} />}

        {_txForComponent?.safeTxHash && (
          <div className="flex justify-center pt-2 pb-10 mx-6">
            <a target="_blank" rel="noopener noreferrer"
              className="text-green-500 hover:underline text-lg"
              href={`https://gnosis-safe.io/app/eth:${owner}/transactions/${_txForComponent?.safeTxHash}`}>
              Sign on Gnosis Safe
            </a>
          </div>
        )}
      </div>
    </>
  )
}

function V1Compare({ projectId, tx, rawData }: { projectId: number, tx?: SafeMultisigTransaction, rawData?: string }) {
  // state
  const [previewConfig, setPreviewConfig] = useState<FundingCycleConfigProps>(undefined);

  // for compare
  const { value: fc, loading: fcIsLoading } = useCurrentFundingCycle({ projectId });
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
    const newConfig = parseSafeJuiceboxTx(getVersionOfTx(tx, 1), tx?.data || rawData, tx?.submissionDate, fc?.fee, fc?.configured);
    if (newConfig) {
      setPreviewConfig(newConfig);
    }
  }, [tx, fc, rawData]);

  return (
    (loading || dataIsEmpty)
      ? <div className="text-center">Loading...</div>
      : <ReconfigurationCompare currentFC={currentConfig} previewFC={previewConfig || currentConfig} />
  )
}

function V2Compare({ projectId, tx, rawData }: { projectId: number, tx?: SafeMultisigTransaction, rawData?: string }) {
  // state
  const [previewConfig, setPreviewConfig] = useState<FundingCycleConfigProps>(undefined);

  // for compare
  const { value: _fc, loading: fcIsLoading } = useCurrentFundingCycleV2({ projectId });
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
    const newConfig = parseSafeJuiceboxTx(getVersionOfTx(tx, 2), tx?.data || rawData, tx?.submissionDate, fee, fc?.configuration);
    if (newConfig) {
      setPreviewConfig(newConfig);
    }
  }, [tx, fc, rawData])

  return (
    (loading || dataIsEmpty)
      ? <div className="text-center">Loading...</div>
      : <ReconfigurationCompare currentFC={currentConfig} previewFC={previewConfig || currentConfig} />
  )
}

function V3Compare({ projectId, tx, rawData }: { projectId: number, tx?: SafeMultisigTransaction, rawData?: string }) {
  const isV3 = true;
  // state
  const [previewConfig, setPreviewConfig] = useState<FundingCycleConfigProps>(undefined);

  // for compare
  const { value: _fc, loading: fcIsLoading } = useCurrentFundingCycleV2({ projectId, isV3 });
  const [fc, metadata] = _fc || [];
  const { value: fee, loading: feeIsLoading } = useTerminalFee({ version: "3" });
  const { value: _limit, loading: targetIsLoading } = useDistributionLimit(projectId, fc?.configuration, isV3);
  const [target, currency] = _limit || [];
  const { value: payoutMods, loading: payoutModsIsLoading } = useCurrentSplits(projectId, fc?.configuration, JBConstants.SplitGroup.ETH, isV3);
  const { value: ticketMods, loading: ticketModsIsLoading } = useCurrentSplits(projectId, fc?.configuration, JBConstants.SplitGroup.RESERVED_TOKEN, isV3);
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
    const newConfig = parseSafeJuiceboxTx(getVersionOfTx(tx, 3), tx?.data || rawData, tx?.submissionDate, fee, fc?.configuration);
    if (newConfig) {
      setPreviewConfig(newConfig);
    }
  }, [tx, fc, rawData])

  return (
    (loading || dataIsEmpty)
      ? <div className="text-center">Loading...</div>
      : <ReconfigurationCompare currentFC={currentConfig} previewFC={previewConfig || currentConfig} />
  )
}
