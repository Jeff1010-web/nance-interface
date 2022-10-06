import { BigNumber, utils } from 'ethers'
import { useState } from 'react';
import { Switch } from '@headlessui/react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import SiteNav from '../components/SiteNav';
import { TransactionDescription } from 'ethers/lib/utils';

import TerminalV1 from '@jbx-protocol/contracts-v1/deployments/mainnet/TerminalV1.json';
import JBControllerV2 from '@jbx-protocol/contracts-v2/deployments/mainnet/JBController.json';
import JBControllerV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBController.json';

const TerminalV1ABI = JSON.stringify(TerminalV1.abi)
const JBControllerV2ABI = JSON.stringify(JBControllerV2.abi)
const JBControllerV3ABI = JSON.stringify(JBControllerV3.abi)

export default function DiffPage() {
    const [splitView, setSplitView] = useState(true)
    const [abiLeft, setAbiLeft] = useState<string>(TerminalV1ABI)
    const [abiRight, setAbiRight] = useState<string>(TerminalV1ABI)
    const [rawDataLeft, setRawDataLeft] = useState<string>('')
    const [rawDataRight, setRawDataRight] = useState<string>('')

    const parsedLeft = parse(abiLeft, rawDataLeft)
    const parsedRight = parse(abiRight, rawDataRight)

    return (
        <>
            <SiteNav pageTitle="Transaction Diff Viewer" />

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
                    <p className='w-1/3 overflow-y-auto'>{(abiLeft && rawDataLeft) && parsedLeft.message}</p>
                    <p className='w-1/3 overflow-y-auto'>{(abiRight && rawDataRight) && parsedRight.message}</p>
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

                <ReactDiffViewer 
                    oldValue={flatten(removeAbundantKeys(parsedLeft.data?.args ?? ''))}
                    newValue={flatten(removeAbundantKeys(parsedRight.data?.args ?? ''))}
                    splitView={splitView} 
                    compareMethod={DiffMethod.WORDS} 
                    leftTitle={splitView ? 'Left' : 'Unified Mode'}
                    rightTitle="Right" />
            </div>
        </>
    )
}

function parse(abi: string, rawData: string) {
    let data: TransactionDescription
    let message = ''
    try {
        const iface = new utils.Interface(abi);
        data = iface.parseTransaction({ data: rawData });
        message = data.signature
    } catch (e) {
        message = e.message;
    }
    console.info('Diff.parse', {abi, rawData, data, message})
    return { data, message };
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function range(start, end) {
    return Array(end - start + 1).fill(1).map((_, idx) => start + idx)
}

function removeAbundantKeys(obj) {
    if(typeof obj === 'object' && obj.length !== undefined) {
        // Array
        if (Object.keys(obj).length === 2*obj.length) {
            // have named keys, let's remove abundant index keys
            // [3, 4, [1, top: 1], [1, 2], first: 3, second: 4, third: {1, top: 1}, fourth: [1,2]] 
            // =>
            // {first: 3, second: 4, third: {top: 1}, fourth: [1,2]]}
            const indexKeys = range(0, obj.length-1).map((i) => i.toString())
            const newObj = {}
            for (const key of Object.keys(obj)) {
                if(!indexKeys.includes(key)) {
                    newObj[key] = removeAbundantKeys(obj[key])
                }
            }
            return newObj
        } else {
            return obj.map(removeAbundantKeys)
        }

    } else {
        return obj
    }
}

function flatten(obj: any, level = 0) {
    // { a: 1, b: { c: 2, d: 3 } }
    // =>
    // a: 1
    // b:
    // > c: 2
    // > d: 3
    return Object.keys(obj).reduce((acc, key) => {
      // BigNumber
      if (BigNumber.isBigNumber(obj[key])) {
        return acc += ` ${'.'.repeat(level)} ${key}: ${utils.formatUnits(obj[key], 0)}\n`
      }
  
      // array, continue to flatten
      if (typeof obj[key] === 'object' && obj[key] !== null && obj[key].length !== undefined) {
        return acc += ` ${'.'.repeat(level)} ${key}: [\n${flatten(obj[key], level+1)}]\n`
      }
  
      // other object, continue to flatten
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        return acc += ` ${'.'.repeat(level)} ${key}: {\n${flatten(obj[key], level+1)}}\n`
      }
  
      // plain value, just stringify it
      return acc += ` ${'.'.repeat(level)} ${key}: ${JSON.stringify(obj[key])}\n`
    }, '');
  }
  