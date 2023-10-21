import Image from "next/image";

import { Tooltip } from "flowbite-react";
import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { SpaceInfo } from "../../../models/NanceTypes";

export default function SpaceHeader({ spaceInfo }: { spaceInfo: SpaceInfo }) {
  let remainingTime = "-";
  let formattedEndTime = "-";
  try {
    const endTime = parseISO(spaceInfo?.currentEvent?.end ?? "");
    formattedEndTime = endTime ? format(endTime, 'EEE MMM dd yyyy HH:mm a') : '-';
    remainingTime = formatDistanceToNowStrict(endTime);
  } catch (error) {
    //console.warn("🔴 Nance.formatDistanceToNowStrict ->", error);
  }

  const { name: spaceName, currentEvent, currentCycle } = spaceInfo;

  return (
    <div className="max-w-7xl md:flex md:space-x-5 bg-white p-6 shadow rounded-md">
      <div className="flex flex-col space-x-0 space-y-6 items-center md:flex-row md:justify-between md:space-x-6 md:space-y-0 w-full">
        <div className="flex-shrink-0 md:w-5/12 flex space-x-3">
          <Image
            className="h-16 w-16 rounded-full"
            src={`https://cdn.stamp.fyi/space/${spaceName}?s=160`}
            alt={`${spaceName} Logo`}
            height={64} width={64}
          />

          <div>
            <h1 className="text-4xl font-bold text-gray-900">{spaceName}</h1>
            <p className="text-sm font-medium text-gray-500 text-right">powered by Nance</p>
          </div>
        </div>

        <div className="break-words p-2 md:w-2/12 text-center rounded-md border-2 border-blue-600 bg-indigo-100">
          <Tooltip content={formattedEndTime}>
            <span className="tooltip-trigger">
              <p className="text-2xl font-semibold">{remainingTime} remaining</p>
            </span>
          </Tooltip>
          <a className="text-sm text-gray-900"
            href="https://info.juicebox.money/dao/process/" target="_blank" rel="noopener noreferrer">
            {currentEvent?.title || "Unknown"} of GC{currentCycle}
          </a>
        </div>
      </div>
    </div>
  );
}
