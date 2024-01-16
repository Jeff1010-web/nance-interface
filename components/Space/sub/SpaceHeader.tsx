import Image from "next/image";

import { Tooltip } from "flowbite-react";
import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { SpaceContext } from "@/context/SpaceContext";
import { useContext } from "react";

export function calculateRemainingTime(endTime: string) {
  let remainingTime = "-";
  let formattedEndTime = "-";
  try {
    const endTimeDate = parseISO(endTime);
    formattedEndTime = endTimeDate
      ? format(endTimeDate, "EEE MMM dd yyyy HH:mm a")
      : "-";
    remainingTime = formatDistanceToNowStrict(endTimeDate);
  } catch (error) {
    //console.warn("🔴 Nance.formatDistanceToNowStrict ->", error);
  }

  return { remainingTime, formattedEndTime };
}

export default function SpaceHeader() {
  const spaceInfo = useContext(SpaceContext);

  if (!spaceInfo) {
    return null;
  }

  const { remainingTime, formattedEndTime } = calculateRemainingTime(
    spaceInfo.currentEvent?.end ?? "",
  );

  const {
    name: spaceName,
    displayName,
    currentEvent,
    currentCycle,
    snapshotSpace,
  } = spaceInfo;

  return (
    <div className="mb-6 hidden max-w-7xl rounded-md bg-white p-6 shadow md:flex md:flex-col md:space-x-5">
      <div className="flex w-full flex-col items-center space-x-0 space-y-6 md:flex-row md:justify-between md:space-x-6 md:space-y-0">
        <div className="flex flex-shrink-0 space-x-3 md:w-5/12">
          <Image
            className="h-16 w-16 rounded-full"
            src={`https://cdn.stamp.fyi/space/${snapshotSpace}?s=160`}
            alt={`${spaceName} Logo`}
            height={64}
            width={64}
          />

          <div>
            <h1 className="text-4xl font-bold text-gray-900">{displayName}</h1>
            <p className="text-right text-sm font-medium text-gray-500">
              powered by Nance
            </p>
          </div>
        </div>

        <div className="break-words rounded-md border-2 border-blue-600 bg-indigo-100 p-2 text-center md:w-2/12">
          <Tooltip content={formattedEndTime}>
            <span className="tooltip-trigger">
              <p className="text-2xl font-semibold">in {remainingTime}</p>
            </span>
          </Tooltip>
          <a
            className="text-sm text-gray-900"
            href="https://info.juicebox.money/dao/process/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {currentEvent?.title || "Unknown"} of GC{currentCycle}
          </a>
        </div>
      </div>
    </div>
  );
}
