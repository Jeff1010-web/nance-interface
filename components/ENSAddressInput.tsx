import { useState } from 'react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
import { Combobox } from '@headlessui/react'
import { useEnsAddress } from 'wagmi'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function ENSAddressInput({ val, setVal, inputStyle = "" }:
  { val: string, setVal: (v: any) => void, inputStyle?: string }) {

  const [query, setQuery] = useState('')
  const { data: address, isLoading } = useEnsAddress({
    name: query,
    enabled: query.endsWith('.eth')
  })

  const filteredOption =
    query.endsWith('.eth') && address
      ? [address]
      : []

  return (
    <Combobox as="div" value={val} onChange={setVal} className="w-full">
      <div className="relative">
        <Combobox.Input
          className={classNames(
            "w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm",
            isLoading && "animate-pulse",
            inputStyle
          )}
          onChange={(event) => {
            setQuery(event.target.value)
            if (!query.endsWith('.eth')) {
              setVal(event.target.value)
            }
          }}
          displayValue={(option: string) => option}
          placeholder="Address/ENS"
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {filteredOption.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOption.map((option) => (
              <Combobox.Option
                key={option}
                value={option}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex items-center">
                      <span
                        className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-green-400"
                        aria-hidden="true"
                      />
                      <span className={classNames('ml-3 truncate', selected && 'font-semibold')}>
                        {option}
                      </span>
                    </div>

                    {selected && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-indigo-600'
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  )
}
