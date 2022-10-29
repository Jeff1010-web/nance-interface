import { BigNumber, utils } from "ethers";
import { useState } from "react";
import { ArgEntry } from "../libs/TransactionArgFormatter";
import FormattedAddress from "./FormattedAddress";

export default function renderArgEntry(entryStr: string) {
    if(!entryStr) return <p></p>

    try {
        const entry: ArgEntry = JSON.parse(entryStr)
        const value = entry.value
        let component
        if (BigNumber.isBigNumber(value)) {
            component = <BigNumberEntry value={value} />
        } else if (utils.isAddress(value)) {
            component = <FormattedAddress address={value} />
        } else {
            component = <p className="inline">{JSON.stringify(value)}</p>
        }

        return (
            <div className="hover:bg-gray-300">
                {' '.repeat(entry.level)}
                <span className="font-semibold mr-1">{entry.key}</span>
                {component}
            </div>
        )
    } catch(e) {
        console.warn("Error parsing entryStr", entryStr)
        return <pre>{entryStr}</pre>
    }
}

function BigNumberEntry({value}: {value: BigNumber}) {
    const [unit, setUnit] = useState(0)

    return (
        <div className="inline-flex">
            <p className="italic">{utils.formatUnits(value, unit)}</p>

            <span className="ml-1 isolate inline-flex rounded-md shadow-sm">
                <button
                    onClick={() => setUnit(18)}
                    disabled={unit === 18}
                    type="button"
                    className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-200 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    18
                </button>
                <button
                    onClick={() => setUnit(6)}
                    disabled={unit === 6}
                    type="button"
                    className="relative -ml-px inline-flex items-center border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-200 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    6
                </button>
                <button
                    onClick={() => setUnit(0)}
                    disabled={unit === 0}
                    type="button"
                    className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-200 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    0
                </button>
            </span>
        </div>
    )
}