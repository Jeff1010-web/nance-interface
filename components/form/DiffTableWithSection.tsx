import { Fragment, useState } from "react";
import { classNames } from "@/utils/functions/tailwind";
import {
  ArchiveBoxIcon,
  ArchiveBoxXMarkIcon,
  BoltIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import ToggleWithLabel from "./ToggleWithLabel";

export type Status = "Add" | "Edit" | "Remove" | "Keep";
const StatusStyle = {
  Add: "text-green-700 bg-green-50 ring-green-600/20 ring-1 ring-inset",
  Edit: "text-yellow-700 bg-yellow-50 ring-yellow-600/20 ring-1 ring-inset",
  Remove: "text-red-700 bg-red-50 ring-red-600/20 ring-1 ring-inset",
  Keep: "text-gray-400",
};
const StatusIcon = {
  Add: (
    <BoltIcon
      className="hidden h-6 w-5 flex-none bg-green-50 text-green-700 ring-green-600/20 sm:block"
      aria-hidden="true"
    />
  ),
  Edit: (
    <PencilSquareIcon
      className="hidden h-6 w-5 flex-none bg-yellow-50 text-yellow-700 ring-yellow-600/20 sm:block"
      aria-hidden="true"
    />
  ),
  Remove: (
    <ArchiveBoxXMarkIcon
      className="hidden h-6 w-5 flex-none bg-red-50 text-red-700 ring-red-600/20 sm:block"
      aria-hidden="true"
    />
  ),
  Keep: (
    <ArchiveBoxIcon
      className="hidden h-6 w-5 flex-none text-gray-400 sm:block"
      aria-hidden="true"
    />
  ),
};

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

export default function DiffTableWithSection({
  space,
  tableData,
  loading = false,
}: {
  space: string;
  tableData: SectionTableData[];
  loading?: boolean;
}) {
  const [hideUnchanged, setHideUnchanged] = useState(true);

  // if it's loading, display a skeleton loader with placeholder table, and a pluse animation
  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div>
      <div className="mt-6 overflow-hidden border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="my-2 flex justify-center">
              <ToggleWithLabel
                label="Hide unchanged"
                enabled={hideUnchanged}
                setEnabled={setHideUnchanged}
              />
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
                      <th
                        scope="colgroup"
                        colSpan={4}
                        className="relative isolate py-2 font-semibold"
                      >
                        <p>{sectionData.section}</p>
                        <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-gray-200 bg-gray-50" />
                        <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-gray-200 bg-gray-50" />
                      </th>
                    </tr>
                    {sectionData.entries.map((entry) => (
                      <tr
                        key={entry.id}
                        className={classNames(
                          hideUnchanged && entry.status === "Keep" && "hidden",
                        )}
                      >
                        <td className="relative py-5 pr-6">
                          <div className="flex gap-x-6">
                            {StatusIcon[entry.status]}
                            <div className="flex-auto">
                              <div className="flex items-start gap-x-3">
                                <div className="text-sm font-medium leading-6 text-gray-900">
                                  {entry.title}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                          <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                        </td>
                        <td className="hidden py-5 pr-6 sm:table-cell">
                          {entry.proposal > 0 && (
                            <Link href={`/s/${space}/${entry.proposal}`}>
                              <div className="text-sm leading-6 text-gray-900">
                                {entry.proposal}
                              </div>
                            </Link>
                          )}
                        </td>
                        <td className="hidden py-5 pr-6 sm:table-cell">
                          <div className="max-w-[12rem] overflow-x-scroll text-center text-sm leading-6 text-gray-900">
                            {entry.oldVal || "---"}
                          </div>
                        </td>
                        <td className="py-5">
                          <div
                            className={classNames(
                              StatusStyle[entry.status],
                              "max-w-[12rem] overflow-x-scroll rounded-md px-2 py-1 text-center text-xs font-medium",
                            )}
                          >
                            {entry.newVal || "---"}
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
  );
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
                    <th
                      scope="colgroup"
                      colSpan={4}
                      className="relative isolate py-2 font-semibold"
                    >
                      {/* Section */}
                      <p className="h-6 w-32 animate-pulse rounded bg-slate-200"></p>
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
  );
}

function RowSkeleton() {
  return (
    <tr>
      <td className="relative py-5 pr-6">
        <div className="flex gap-x-6">
          {/* Icon */}
          <div
            className="hidden h-6 w-5 flex-none rounded bg-slate-200 sm:block"
            aria-hidden="true"
          />
          <div className="flex-auto">
            <div className="flex items-start gap-x-3">
              {/* Title */}
              <div className="h-6 w-32 animate-pulse rounded bg-slate-200 text-sm font-medium leading-6 text-gray-900"></div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
        <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
      </td>
      <td className="hidden py-5 pr-6 sm:table-cell">
        {/* Proposal */}
        <div className="h-6 w-32 animate-pulse rounded bg-slate-200 text-sm leading-6 text-gray-900"></div>
      </td>
      <td className="hidden py-5 pr-6 sm:table-cell">
        {/* Old Value */}
        <div className="h-6 w-32 animate-pulse rounded bg-slate-200 text-sm leading-6 text-gray-900"></div>
      </td>
      <td className="py-5">
        {/* New Value */}
        <div className="h-6 w-32 animate-pulse rounded-md bg-slate-200 px-2 py-1 text-xs font-medium"></div>
      </td>
    </tr>
  );
}
