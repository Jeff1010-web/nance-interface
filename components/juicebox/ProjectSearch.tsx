import { useState } from 'react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/solid'
import { Combobox } from '@headlessui/react'
import useProjectSearch from '../../hooks/juicebox/ProjectSearch'
import useProjectMetadata from '../../hooks/juicebox/ProjectMetadata'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export interface ProjectOption {
  id: string
  version: string
  handle: string
  projectId: number
  metadataUri: string
}

export default function ProjectSearch({ onProjectOptionSet, label }: { onProjectOptionSet: (option: ProjectOption) => void, label: string }) {
  const [query, setQuery] = useState('')
  const [val, setVal] = useState<ProjectOption>()

  const { data: projects } = useProjectSearch(query);

  const options: ProjectOption[] = projects?.map((project) => {
    return {
      id: project.id,
      version: project.pv,
      handle: project.handle,
      projectId: project.projectId,
      metadataUri: project.metadataUri
    }
  }) || []

  const updateVal = (option: ProjectOption) => {
    setVal(option)
    onProjectOptionSet(option)
  }

  return (
    <Combobox as="div" value={val} onChange={updateVal}>
      <Combobox.Label className="block text-sm font-medium text-gray-700">{label}</Combobox.Label>
      <div className="relative mt-1">

        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(option: ProjectOption) => option?.handle}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {options.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((option) => (
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
                    <ProjectInfoEntry option={option} />

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

function ProjectInfoEntry({ option }: { option: ProjectOption }) {
  const { data, loading, error } = useProjectMetadata(option.metadataUri)

  return (
    <div className="flex flex-col">
      <div>
        <span
          className={classNames(
            'inline-block h-2 w-2 flex-shrink-0 rounded-full',
            option.version === "2" ? 'bg-green-400' : 'bg-gray-200'
          )}
          aria-hidden="true"
        />

        <span className="ml-3 truncate">
          {option.version?.[0] === "1" ? "(v1) " : ""}
          {data?.name || "..."}
          <span className="sr-only"> is {option.version === "2" ? 'newest' : 'old'}</span>
        </span>
      </div>

      <p className="ml-3 truncate text-gray-400">
        {option.handle ? ` @${option.handle}` : ""}
        {` @id: ${option.projectId}` || ""}
      </p>
    </div>
  )
}
