import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { classNames } from '../../libs/tailwind';
import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';
import TenderlySimulationButton from '../ethereum/TenderlySimulationButton';
import { useCreateTransaction } from '../../hooks/SafeHooks';
import { TenderlySimulateArgs } from '../../hooks/TenderlyHooks';

export interface TransactionEntry {
  title: JSX.Element
  proposal: string
  transactionData: SafeTransactionDataPartial
}

export default function OrderCheckboxTable({ safeAddress, entries }: { safeAddress: string, entries: TransactionEntry[] }) {
  
  const checkbox = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TransactionEntry[]>([]);
  const [shouldSimulate, setShouldSimulate] = useState<boolean>(false);

  const { value: safeTransaction } = useCreateTransaction(safeAddress, selectedEntry.map(e => e.transactionData));

  const simulationArgs: TenderlySimulateArgs = {
    from: safeAddress,
    to: safeTransaction?.data.to || "",
    value: parseInt(safeTransaction?.data.value || "0"),
    input: safeTransaction?.data.data || ""
  };

  useLayoutEffect(() => {
    const isIndeterminate = selectedEntry.length > 0 && selectedEntry.length < entries.length;
    setChecked(selectedEntry.length === entries.length);
    setIndeterminate(isIndeterminate);
    checkbox.current!.indeterminate = isIndeterminate;
  }, [selectedEntry]);

  useEffect(() => {
    if (shouldSimulate) {
      setShouldSimulate(false);
    }
  }, [selectedEntry]);

  function toggleAll() {
    setSelectedEntry(checked || indeterminate ? [] : entries);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              {selectedEntry.length > 0 && (
                <div className="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
                  <TenderlySimulationButton simulationArgs={simulationArgs} shouldSimulate={shouldSimulate} setShouldSimulate={setShouldSimulate} />
                </div>
              )}
              <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        ref={checkbox}
                        checked={checked}
                        onChange={toggleAll}
                      />
                    </th>
                    <th scope="col" className="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
                      Title
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Proposal
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {entries.map((entry, index) => (
                    <tr key={index} className={selectedEntry.includes(entry) ? 'bg-gray-50' : undefined}>
                      <td className="relative px-7 sm:w-12 sm:px-6">
                        {selectedEntry.includes(entry) && (
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />
                        )}
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          value={entry.transactionData.data}
                          checked={selectedEntry.includes(entry)}
                          onChange={(e) =>
                            setSelectedEntry(
                              e.target.checked
                                ? [...selectedEntry, entry]
                                : selectedEntry.filter((p) => p !== entry)
                            )
                          }
                        />
                      </td>
                      <td
                        className={classNames(
                          'whitespace-nowrap py-4 pr-3 text-sm font-medium',
                          selectedEntry.includes(entry) ? 'text-indigo-600' : 'text-gray-900'
                        )}
                      >
                        {selectedEntry.includes(entry) && <span className="mr-2 underline">{"No."}{selectedEntry.indexOf(entry) + 1}</span>}
                        {entry.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{entry.proposal}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{entry.transactionData.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
