import { Fragment, useState } from 'react';
import { classNames } from '../../libs/tailwind';
import { ArchiveBoxIcon, ArchiveBoxXMarkIcon, BoltIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ToggleWithLabel from './ToggleWithLabel';

export type Status = "Add" | "Edit" | "Remove" | "Keep";
const StatusStyle = {
  Add: "text-green-700 bg-green-50 ring-green-600/20 ring-1 ring-inset",
  Edit: "text-yellow-700 bg-yellow-50 ring-yellow-600/20 ring-1 ring-inset",
  Remove: "text-red-700 bg-red-50 ring-red-600/20 ring-1 ring-inset",
  Keep: "text-gray-400"
}
const StatusIcon = {
  Add: <BoltIcon
    className="text-green-700 bg-green-50 ring-green-600/20 hidden h-6 w-5 flex-none sm:block"
    aria-hidden="true"
  />,
  Edit: <PencilSquareIcon
    className="text-yellow-700 bg-yellow-50 ring-yellow-600/20 hidden h-6 w-5 flex-none sm:block"
    aria-hidden="true"
  />,
  Remove: <ArchiveBoxXMarkIcon
    className="text-red-700 bg-red-50 ring-red-600/20 hidden h-6 w-5 flex-none sm:block"
    aria-hidden="true"
  />,
  Keep: <ArchiveBoxIcon
    className="text-gray-400 hidden h-6 w-5 flex-none sm:block"
    aria-hidden="true"
  />
}

interface Entry {
  id: string;
  title: any;
  proposal: number;
  oldVal: string;
  newVal: string;
  valueToBeSorted: number;
  status: Status;
}

export interface SectionTableData {
  section: string;
  entries: Entry[];
}

export default function TableWithSection(
  { space, tableData, loading = false }: 
  { space: string, tableData: SectionTableData[], loading?: boolean }) {

  const [hideUnchanged, setHideUnchanged] = useState(false);

  // if it's loading, display a skeleton loader with placeholder table, and a pluse animation
  if (loading) {
    return <TableSkeleton />
  }

  return (
    <div>
      <div className="mt-6 overflow-hidden border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="flex justify-center my-2">
              <ToggleWithLabel label="Hide unchanged" enabled={hideUnchanged} setEnabled={setHideUnchanged} />
            </div>
            <table className="w-full text-left">
              <thead className="sr-only">
                <tr>
                  <th>Title</th>
                  <th className="hidden sm:table-cell">proposal</th>
                  <th className="hidden sm:table-cell">oldVal</th>
                  <th>newVal</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((sectionData) => (
                  <Fragment key={sectionData.section}>
                    <tr className="text-sm leading-6 text-gray-900">
                      <th scope="colgroup" colSpan={4} className="relative isolate py-2 font-semibold">
                        <p>{sectionData.section}</p>
                        <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-gray-200 bg-gray-50" />
                        <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-gray-200 bg-gray-50" />
                      </th>
                    </tr>
                    {sectionData.entries.map((entry) => (
                      <tr key={entry.id} className={classNames(hideUnchanged && entry.status === "Keep" && "hidden")}>
                        <td className="relative py-5 pr-6">
                          <div className="flex gap-x-6">
                            {StatusIcon[entry.status]}
                            <div className="flex-auto">
                              <div className="flex items-start gap-x-3">
                                <div className="text-sm font-medium leading-6 text-gray-900">{entry.title}</div>
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                          <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                        </td>
                        <td className="hidden py-5 pr-6 sm:table-cell">
                          {entry.proposal > 0 && (
                            <Link href={`/s/${space}/${entry.proposal}`}>
                              <div className="text-sm leading-6 text-gray-900">{entry.proposal}</div>
                            </Link>
                          )}
                        </td>
                        <td className="hidden py-5 pr-6 sm:table-cell">
                          <div className="text-sm leading-6 text-gray-900">{entry.oldVal}</div>
                        </td>
                        <td className="py-5">
                          <div
                            className={classNames(
                              StatusStyle[entry.status],
                              'rounded-md py-1 px-2 text-xs font-medium'
                            )}
                          >
                            {entry.newVal}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div>
      <div className="mt-6 overflow-hidden border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            <table className="w-full text-left">
              <thead className="sr-only">
                <tr>
                  <th>Title</th>
                  <th className="hidden sm:table-cell">proposal</th>
                  <th className="hidden sm:table-cell">oldVal</th>
                  <th>newVal</th>
                </tr>
              </thead>
              <tbody>
                <Fragment>
                  <tr className="text-sm leading-6 text-gray-900">
                    <th scope="colgroup" colSpan={4} className="relative isolate py-2 font-semibold">
                      {/* Section */}
                      <p className="animate-pulse h-6 w-32 bg-slate-200 rounded"></p>
                      <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-gray-200 bg-gray-50" />
                      <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-gray-200 bg-gray-50" />
                    </th>
                  </tr>

                  <RowSkeleton />
                  <RowSkeleton />
                  <RowSkeleton />
                </Fragment>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function RowSkeleton() {
  return (
    <tr>
      <td className="relative py-5 pr-6">
        <div className="flex gap-x-6">
          {/* Icon */}
          <div
            className="hidden h-6 w-5 flex-none sm:block bg-slate-200 rounded"
            aria-hidden="true"
          />
          <div className="flex-auto">
            <div className="flex items-start gap-x-3">
              {/* Title */}
              <div className="text-sm font-medium leading-6 text-gray-900 animate-pulse h-6 w-32 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
        <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
      </td>
      <td className="hidden py-5 pr-6 sm:table-cell">
        {/* Proposal */}
        <div className="text-sm leading-6 text-gray-900 animate-pulse h-6 w-32 bg-slate-200 rounded"></div>
      </td>
      <td className="hidden py-5 pr-6 sm:table-cell">
        {/* Old Value */}
        <div className="text-sm leading-6 text-gray-900 animate-pulse h-6 w-32 bg-slate-200 rounded"></div>
      </td>
      <td className="py-5">
        {/* New Value */}
        <div className="rounded-md py-1 px-2 text-xs font-medium animate-pulse h-6 w-32 bg-slate-200"></div>
      </td>
    </tr>
  )
}