import { useState } from 'react';
import { Switch } from '@headlessui/react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import SiteNav from '../components/SiteNav';

import TerminalV1 from '@jbx-protocol/contracts-v1/deployments/mainnet/TerminalV1.json';
import JBControllerV2 from '@jbx-protocol/contracts-v2/deployments/mainnet/JBController.json';
import JBControllerV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBController.json';
import formatArgs from '../libs/TransactionArgFormatter';
import renderArgEntry from '../components/TransactionArgEntry';

const TerminalV1ABI = JSON.stringify(TerminalV1.abi)
const JBControllerV2ABI = JSON.stringify(JBControllerV2.abi)
const JBControllerV3ABI = JSON.stringify(JBControllerV3.abi)

export default function DiffPage() {
    // const tabs = ['Raw', 'Formatted']
    // const [currentTab, setCurrentTab] = useState('Raw')

    const [splitView, setSplitView] = useState(true)
    const [abiLeft, setAbiLeft] = useState<string>(TerminalV1ABI)
    const [abiRight, setAbiRight] = useState<string>(TerminalV1ABI)
    const [rawDataLeft, setRawDataLeft] = useState<string>('')
    const [rawDataRight, setRawDataRight] = useState<string>('')

    const { data: leftStr, message: leftMessage } = formatArgs(abiLeft, rawDataLeft)
    const { data: rightStr, message: rightMessage } = formatArgs(abiRight, rawDataRight)

    return (
        <>
            <SiteNav pageTitle="Transaction Diff Viewer" />
            {/* <Tabs tabs={tabs} currentTab={currentTab} setCurrentTab={setCurrentTab} /> */}
            <div className="bg-white">
                <div className="flex justify-around p-6">
                    <select
                        id="contract-select-left"
                        name="contract-select-left"
                        className="w-1/3 mt-1 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        onChange={(e) => setAbiLeft(e.target.value)}
                    >
                        <option value={TerminalV1ABI}>TerminalV1</option>
                        <option value={JBControllerV2ABI}>JBControllerV2</option>
                        <option value={JBControllerV3ABI}>JBControllerV3</option>
                    </select>
                    <select
                        id="contract-select-right"
                        name="contract-select-right"
                        className="w-1/3 mt-1 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        onChange={(e) => setAbiRight(e.target.value)}
                    >
                        <option value={TerminalV1ABI}>TerminalV1</option>
                        <option value={JBControllerV2ABI}>JBControllerV2</option>
                        <option value={JBControllerV3ABI}>JBControllerV3</option>
                    </select>
                </div>

                <div id="message-info" className="flex justify-around gap-x-3">
                    <p className='w-1/3 overflow-y-auto'>{(abiLeft && rawDataLeft) && leftMessage}</p>
                    <p className='w-1/3 overflow-y-auto'>{(abiRight && rawDataRight) && rightMessage}</p>
                </div>

                <div id="abi-input" className="flex justify-around gap-x-3 py-6">
                    <textarea rows={3} className="w-1/3 rounded-xl ml-3" id="raw-data-left" placeholder="Paste ABI here" value={abiLeft} onChange={(e) => setAbiLeft(e.target.value)} />
                    <textarea rows={3} className="w-1/3 rounded-xl mr-3" id="raw-data-right" placeholder="Paste ABI here" value={abiRight} onChange={(e) => setAbiRight(e.target.value)} />
                </div>

                <div id="data-input" className="flex justify-around gap-x-3 pb-6">
                    <textarea rows={3} className="w-1/3 rounded-xl ml-3" id="raw-data-left" placeholder="Paste raw data here" value={rawDataLeft} onChange={(e) => setRawDataLeft(e.target.value)} />
                    <textarea rows={3} className="w-1/3 rounded-xl mr-3" id="raw-data-right" placeholder="Paste raw data here" value={rawDataRight} onChange={(e) => setRawDataRight(e.target.value)} />
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
                    oldValue={leftStr}
                    newValue={rightStr}
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