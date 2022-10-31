import { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import SiteNav from '../components/SiteNav';

import TerminalV1 from '@jbx-protocol/contracts-v1/deployments/mainnet/TerminalV1.json';
import TerminalV1_1 from '@jbx-protocol/contracts-v1/deployments/mainnet/TerminalV1_1.json';
import JBControllerV2 from '@jbx-protocol/contracts-v2/deployments/mainnet/JBController.json';
import JBControllerV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBController.json';
import formatArgs from '../libs/TransactionArgFormatter';
import renderArgEntry from '../components/TransactionArgEntry';
import SearchableComboBox, { Option } from '../components/SearchableComboBox';
import Notification from "../components/Notification";
import { useHistoryTransactions, useQueuedTransactions } from '../hooks/SafeHooks';
import { GnosisHandler } from '../libs/gnosis';
import { useRouter } from 'next/router';
import { QueueSafeTransaction, SafeMultisigTransaction, SafeMultisigTransactionResponse } from '../models/SafeTypes';
import { StringParam, useQueryParam, withDefault } from 'next-query-params';
import { useEnsAddress, useAccount, useSigner } from 'wagmi';
import { JsonRpcSigner } from "@ethersproject/providers";
import { useReconfigureRequest } from '../hooks/NanceHooks';
import { FetchReconfigureRequest, IFetchReconfigureResponse } from '../models/NanceTypes';

type ABIOption = Option & { abi: string }
type TxOption = Option & { tx: SafeMultisigTransaction }

const PRELOAD_ABI_OPTIONS: { [address: string]: ABIOption } = {
    [TerminalV1.address]:  { id: TerminalV1.address, label: `TerminalV1 (${TerminalV1.address})`, abi: JSON.stringify(TerminalV1.abi), status: true },
    [TerminalV1_1.address]: { id: TerminalV1_1.address, label: `TerminalV1_1 (${TerminalV1_1.address})`, abi: JSON.stringify(TerminalV1_1.abi), status: true },
    [JBControllerV2.address]: { id: JBControllerV2.address, label: `JBControllerV2 (${JBControllerV2.address})`, abi: JSON.stringify(JBControllerV2.abi), status: true },
    [JBControllerV3.address]: { id: JBControllerV3.address, label: `JBControllerV3 (${JBControllerV3.address})`, abi: JSON.stringify(JBControllerV3.abi), status: true },
}
const ABIOptions: ABIOption[] = Object.values(PRELOAD_ABI_OPTIONS)

const TABS = ["Simple", "Nance"]

export default function DiffPage() {
    const [currentTab, setCurrentTab] = useState("Simple");

    return (
        <>
            <SiteNav pageTitle="Transaction Diff Viewer" withWallet />
            <Tabs tabs={TABS} currentTab={currentTab} setCurrentTab={setCurrentTab} />

            {currentTab === "Simple" && <SimpleDiff />}
            {currentTab === "Nance" && <NanceDiff />}
        </>
    )
}

function NanceDiff() {
    const safeAddress = "0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e"
    const abi = JSON.stringify(TerminalV1.abi)

    const [rawDataLeft, setRawDataLeft] = useState<string>('')

    const [selectedSafeTx, setSelectedSafeTx] = useState<TxOption>(undefined)
    const [networkParam, setNetworkParam] = useQueryParam("network", StringParam)
    // const [reconfigRequest, setReconfigRequest] = useState<FetchReconfigureRequest>(undefined)
    const [fetchReconfig, setFetchReconfig] = useState(false);
    const [gnosisLoading, setGnosisLoading] = useState(false)
    const [nanceResponse, setNanceResponse] = useState<IFetchReconfigureResponse>(undefined)
    const [gnosisResponse, setGnosisResponse] = useState({success: undefined, data: undefined})
    const [error, setError] = useState<string>(undefined)
    const [currentTime, setCurrentTime] = useState<string>(undefined)

    const { address } = useAccount();
    const { data: signer, isError, isLoading: signerLoading } = useSigner()
    const jrpcSigner = signer as JsonRpcSigner;

    const { data: reconfig, isLoading: reconfigLoading, error: reconfigError } = useReconfigureRequest({
        space: "juicebox",
        version: "V1",
        address: address || '0x0000000000000000000000000000000000000000',
        datetime: currentTime,
        network: networkParam || 'mainnet'
    }, currentTime !== undefined);
    const reconfigData = reconfig?.data
    const rawDataRight = reconfigData?.transaction?.bytes

    // FIXME not fixed to v1 abi
    const { data: leftStr, message: leftMessage } = formatArgs(abi, rawDataLeft)
    const { data: rightStr, message: rightMessage } = formatArgs(abi, rawDataRight)

    useEffect(() => {
        setCurrentTime(new Date().toISOString())
    }, [address, networkParam])

    const txSetter = (val: TxOption) => {
        setSelectedSafeTx(val)
        if(val?.tx.data) {
            setRawDataLeft(val?.tx.data)
        }
    }

    const resetErrors = () => {
        setGnosisResponse({success: undefined, data: undefined});
        setError(undefined);
    }

    const postTransaction = async () => {
        setGnosisLoading(true);
        const gnosis = new GnosisHandler(reconfigData?.safe, networkParam || 'mainnet');
        const txnPartial = {
            to: reconfigData?.transaction?.address,
            value: 0,
            data: reconfigData?.transaction?.bytes,
            nonce: reconfigData?.nonce
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

    return (
        <>
            <Notification title="Success" description={`Transaction queued!`} show={gnosisResponse?.success === true} close={resetErrors} checked={true} />
            {(gnosisResponse?.success === false || reconfigError ) &&
            <Notification title="Error" description={`Problem submitting transaction: ${gnosisResponse?.data || reconfigError}`} show={true} close={resetErrors} checked={false} />
            }
            <div className="bg-white">
                <div className="flex flex-col w-2/3 p-6">
                    <SafeTransactionSelector safeAddress={safeAddress} val={selectedSafeTx} setVal={txSetter} />
                </div>
                <div className="flex w-5/6 ml-10 space-x-5">
                    <button
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
                        disabled={!jrpcSigner || !rawDataRight}
                        onClick={postTransaction}
                    >{(gnosisLoading) ? 'sign...' : 'queue gnosis transaction'}</button>
                    <input
                        type="number"
                        placeholder="nonce"
                        value={nanceResponse?.nonce || ''}
                        onChange={(e) => setNanceResponse({...nanceResponse, nonce: e.target.value})}
                        className="block rounded rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                    />
                </div>

                <div className="m-3">
                    <ReactDiffViewer 
                        oldValue={leftStr || (rawDataLeft && abi ? leftMessage : '')}
                        newValue={rightStr || (rawDataRight && abi ? rightMessage : '')}
                        splitView={false} 
                        compareMethod={DiffMethod.LINES} 
                        leftTitle={true ? 'Left' : 'Unified Mode'}
                        rightTitle="Right"
                        renderContent={(s) => renderArgEntry(s)} />
                </div>
            </div>
        </>
    )
}

function SafeTransactionSelector({safeAddress, val, setVal, shouldRun = true} : {safeAddress: string, val: TxOption, setVal: (val: TxOption) => void, shouldRun?: boolean}) {
    const { data: historyTxs, isLoading: historyTxsLoading } = useHistoryTransactions(safeAddress, 10, shouldRun)
    const { data: queuedTxs, isLoading: queuedTxsLoading } = useQueuedTransactions(safeAddress, historyTxs?.count, 10, historyTxs?.count !== undefined)

    const convertToOptions = (res: SafeMultisigTransactionResponse, status: boolean) => {
        if(!res) return []
        return res.results.map((tx) => {
            return {
                id: tx.safeTxHash,
                label: `Tx ${tx.nonce} ${tx.dataDecoded ? tx.dataDecoded.method : 'unknown'} -- ${tx.submissionDate}`,
                status,
                tx: tx
            }
        })
    }
    const options = convertToOptions(queuedTxs, true).concat(convertToOptions(historyTxs, false))

    return (
        <SearchableComboBox val={val} setVal={setVal} options={options} label="Load Safe Transaction" />
    )
}

function SimpleDiff() {
    // router
    const router = useRouter();

    // state
    const [safeAddressParam, setSafeAddressParam] = useQueryParam("safe", withDefault(StringParam, ''))
    const [splitView, setSplitView] = useState(true)
    
    // -- abi
    const [abiOptionLeft, setAbiOptionLeft] = useState<ABIOption>(undefined)
    const [abiOptionRight, setAbiOptionRight] = useState<ABIOption>(undefined)
    const [abiLeft, setAbiLeft] = useState<string>(undefined)
    const [abiRight, setAbiRight] = useState<string>(undefined)
    // -- raw data
    const [optionLeft, setOptionLeft] = useState<TxOption>(undefined)
    const [optionRight, setOptionRight] = useState<TxOption>(undefined)
    const [rawDataLeft, setRawDataLeft] = useState<string>('')
    const [rawDataRight, setRawDataRight] = useState<string>('')

    const { data: leftStr, message: leftMessage } = formatArgs(abiLeft, rawDataLeft)
    const { data: rightStr, message: rightMessage } = formatArgs(abiRight, rawDataRight)

    // external
    const { data: safeAddressResolved } = useEnsAddress({
        name: safeAddressParam,
        enabled: safeAddressParam?.endsWith('.eth')
    })
    const safeAddress = safeAddressResolved || safeAddressParam
    
    const isLoading = !router.isReady;

    // shortcut
    const abiOptionSetter = (setVal: (val: ABIOption) => void, setData: (val: string) => void) => {
        return (val: ABIOption) => {
            setVal(val)
            if(val?.abi) {
                setData(val?.abi)
            }
        }
    }
    const optionSetterLeft = (val: TxOption) => {
        setOptionLeft(val)
        if(val?.tx.data) {
            setRawDataLeft(val?.tx.data)
        }
        if(val?.tx.to) {
            const option = PRELOAD_ABI_OPTIONS[val?.tx.to]
            if(option) {
                setAbiOptionLeft(option)
                setAbiLeft(option.abi)
            }
        }
    }
    const optionSetterRight = (val: TxOption) => {
        setOptionRight(val)
        if(val?.tx.data) {
            setRawDataRight(val?.tx.data)
        }
        if(val?.tx.to) {
            const option = PRELOAD_ABI_OPTIONS[val?.tx.to]
            if(option) {
                setAbiOptionRight(option)
                setAbiRight(option.abi)
            }
        }
    }

    return (
        <>
            <div className="bg-white">
                <div className="flex flex-col w-2/3 p-6">
                    <label htmlFor="safeAddress" className="block text-sm font-medium text-gray-700">
                        Safe Address
                    </label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="safeAddress"
                            id="safeAddress"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="you@example.com"
                            aria-describedby="email-description"
                            value={safeAddressParam}
                            onChange={(e) => setSafeAddressParam(e.target.value)}
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-500" id="safeAddress-description">
                        {`Resolved to ${safeAddress}`}
                    </p>
                </div>

                <div className="flex justify-around py-6">
                    <div className="w-1/3 ml-3">
                        <SearchableComboBox val={abiOptionLeft} setVal={abiOptionSetter(setAbiOptionLeft, setAbiLeft)} options={ABIOptions} label="Load Contract ABI" />
                    </div>
                    
                    <div className="w-1/3 ml-3">
                        <SearchableComboBox val={abiOptionRight} setVal={abiOptionSetter(setAbiOptionRight, setAbiRight)} options={ABIOptions} label="Load Contract ABI" />
                    </div>      
                </div>

                <div id="abi-input" className="flex justify-around gap-x-3 pb-6">
                    <div className="w-1/3 ml-3">
                        <label htmlFor="abi-left" className="block text-sm font-medium text-gray-700">
                            ABI (Left)
                        </label>
                        <div className="mt-1">
                            <textarea rows={3} className="w-full rounded-xl" id="abi-left" placeholder="Paste ABI here" value={abiLeft} onChange={(e) => setAbiLeft(e.target.value)} />
                        </div>
                    </div>

                    <div className="w-1/3 ml-3">
                        <label htmlFor="abi-right" className="block text-sm font-medium text-gray-700">
                            ABI (Right)
                        </label>
                        <div className="mt-1">
                            <textarea rows={3} className="w-full rounded-xl" id="abi-right" placeholder="Paste ABI here" value={abiRight} onChange={(e) => setAbiRight(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-around gap-x-3 pb-6">
                    <div className="w-1/3 ml-3">
                        <SafeTransactionSelector safeAddress={safeAddress} shouldRun={router.isReady} val={optionLeft} setVal={optionSetterLeft} />
                    </div>

                    <div className="w-1/3 ml-3">
                        <SafeTransactionSelector safeAddress={safeAddress} shouldRun={router.isReady} val={optionRight} setVal={optionSetterRight} />
                    </div>
                </div>

                <div id="data-input" className="flex justify-around gap-x-3 pb-6">
                    <div className="w-1/3 ml-3">
                        <label htmlFor="raw-data-left" className="block text-sm font-medium text-gray-700">
                            Raw Data (Left)
                        </label>
                        <div className="mt-1">
                            <textarea rows={3} className="w-full rounded-xl" id="raw-data-left" placeholder="Paste raw data here" value={rawDataLeft} onChange={(e) => setRawDataLeft(e.target.value)} />
                        </div>
                    </div>

                    <div className="w-1/3 ml-3">
                        <label htmlFor="raw-data-right" className="block text-sm font-medium text-gray-700">
                            Raw Data (Right)
                        </label>
                        <div className="mt-1">
                            <textarea rows={3} className="w-full rounded-xl" id="raw-data-right" placeholder="Paste raw data here" value={rawDataRight} onChange={(e) => setRawDataRight(e.target.value)} />
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-center mb-3">
                    <Switch.Group as="div" className="items-center">
                        <Switch
                            checked={splitView}
                            onChange={setSplitView}
                            className={classNames(
                            splitView ? 'bg-indigo-600' : 'bg-gray-200',
                            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                            )}
                        >
                            <span
                            aria-hidden="true"
                            className={classNames(
                                splitView ? 'translate-x-5' : 'translate-x-0',
                                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                            )}
                            />
                        </Switch>
                        <Switch.Label as="span" className="ml-3">
                            <span className="text-sm font-medium text-gray-900">Split View</span>
                        </Switch.Label>
                    </Switch.Group>
                </div>
            </div>

            <div className="m-3">
                <ReactDiffViewer 
                    oldValue={leftStr || (rawDataLeft && abiLeft ? leftMessage : '')}
                    newValue={rightStr || (rawDataRight && abiRight ? rightMessage : '')}
                    splitView={splitView} 
                    compareMethod={DiffMethod.LINES} 
                    leftTitle={splitView ? 'Left' : 'Unified Mode'}
                    rightTitle="Right"
                    renderContent={(s) => renderArgEntry(s)} />
            </div>
        </>
    )
}
  
function Tabs({ tabs, currentTab, setCurrentTab }: { tabs: string[], currentTab: string, setCurrentTab: (tab: string) => void }) {
    return (
        <div className="m-6">
            <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                    Select a tab
                </label>
                {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
                <select
                    id="tabs"
                    name="tabs"
                    className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    value={currentTab}
                    onChange={(e) => setCurrentTab(e.target.value)}
                >
                    {tabs.map((tab) => (
                        <option key={tab}>{tab}</option>
                    ))}
                </select>
            </div>
            <div className="hidden sm:block">
                <nav className="isolate flex divide-x divide-gray-200 rounded-lg shadow" aria-label="Tabs">
                    {tabs.map((tab, tabIdx) => (
                        <button
                            key={tab}
                            onClick={() => setCurrentTab(tab)}
                            className={classNames(
                                (tab === currentTab) ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
                                tabIdx === 0 ? 'rounded-l-lg' : '',
                                tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
                                'group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10'
                            )}
                            aria-current={(tab === currentTab) ? 'page' : undefined}
                        >
                            <span>{tab}</span>
                            <span
                                aria-hidden="true"
                                className={classNames(
                                    (tab === currentTab) ? 'bg-indigo-500' : 'bg-transparent',
                                    'absolute inset-x-0 bottom-0 h-0.5'
                                )}
                            />
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    )
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}