import { Dispatch, SetStateAction, useState } from 'react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/solid'
import { Combobox } from '@headlessui/react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export interface Option {
    id: string
    label: string
    status: boolean
    extraLabel?: string
}

export default function SearchableComboBox<T extends Option>({val, setVal, options, label}: {val: T, setVal: (v: T) => void, options: T[], label: string}) {
  const [query, setQuery] = useState('')

  const filteredOption =
    query === ''
      ? options
      : options.filter((option) => {
          return option.label.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <Combobox as="div" value={val} onChange={setVal}>
      <Combobox.Label className="block text-sm font-medium text-gray-700">{label}</Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(option: Option) => option?.label}
          placeholder={label}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {filteredOption.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOption.map((option) => (
              <Combobox.Option
                key={option.id}
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
                        className={classNames(
                          'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                          option.status ? 'bg-green-400' : 'bg-gray-200'
                        )}
                        aria-hidden="true"
                      />
                      <span className={classNames('ml-3 truncate', selected && 'font-semibold')}>
                        {option.label}
                        <span className="sr-only"> is {option.status ? 'online' : 'offline'}</span>
                      </span>
                      {option.extraLabel && (<span className="ml-3 text-gray-500">{option.extraLabel}</span>)}
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
