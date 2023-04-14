import { useState } from 'react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/solid'
import { Combobox } from '@headlessui/react'
import useProjectSearch, { ProjectSearchEntry } from '../../hooks/juicebox/ProjectSearch'
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

export default function ProjectSearch({ val, setVal }: { val: number, setVal: (v: number) => void }) {
  const [query, setQuery] = useState('')

  const { data: projects, loading } = useProjectSearch(query);

  return (
    <Combobox as="div" value={val} onChange={setVal}>
      <div className="relative mt-1">
        <Combobox.Input
          className={classNames(
            "w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm",
            loading && "animate-pulse"
          )}
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(val: number) => val.toString()}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {projects?.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {projects.map((p) => (
              <Combobox.Option
                key={p.id}
                value={p.projectId}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <ProjectInfoEntry project={p} />

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

function ProjectInfoEntry({ project }: { project: ProjectSearchEntry }) {
  const { data, loading, error } = useProjectMetadata(project.metadataUri)

  return (
    <div className="flex flex-col">
      <div>
        <span
          className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-green-400"
          aria-hidden="true"
        />

        <span className="ml-2 truncate">
          {data?.name || "..."}
        </span>
      </div>

      <p className="ml-3 truncate text-gray-400">
        {project.handle ? ` @${project.handle}` : ""}
        {` @id: ${project.projectId}` || ""}
      </p>
    </div>
  )
}
