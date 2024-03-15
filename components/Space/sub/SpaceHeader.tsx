import { useContext, useState, useEffect } from "react";
import Image from "next/image";
import { Tooltip } from "flowbite-react";
import { parseISO, format, differenceInSeconds } from "date-fns";
import { SpaceContext } from "@/context/SpaceContext";

export function calculateRemainingTime(endTime: string) {
  let remainingTime = "- - - -";
  let formattedEndTime = "- - - -";
  try {
    const endTimeDate = parseISO(endTime);
    formattedEndTime = format(endTimeDate, "EEE MMM dd yyyy h:mm a");
    const difference = differenceInSeconds(endTimeDate, new Date());
    const days = Math.floor(difference / (3600 * 24));
    const hours = String(Math.floor((difference % (3600 * 24)) / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((difference % 3600) / 60)).padStart(2, "0");
    const seconds = String(difference % 60).padStart(2, "0");
    remainingTime = `${days} ${hours} ${minutes} ${seconds}`;
  } catch (error) {
    console.error("Error calculating remaining time:", error);
  }
  return { remainingTime, formattedEndTime };
}

export default function SpaceHeader() {
  const spaceInfo = useContext(SpaceContext);
  const [remainingTime, setRemainingTime] = useState("- -- -- --");
  const [formattedEndTime, setFormattedEndTime] = useState("- -- -- --");

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (spaceInfo && spaceInfo.currentEvent) {
        const { remainingTime, formattedEndTime } = calculateRemainingTime(spaceInfo.currentEvent.end || "");
        setRemainingTime(remainingTime);
        setFormattedEndTime(formattedEndTime);
      }
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [spaceInfo]);

  if (!spaceInfo || !spaceInfo.currentEvent) {
    return null;
  }

  const {
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
            alt={`${displayName} Logo`}
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
        <div className="rounded-md border-2 border-blue-600 bg-indigo-100 py-2 px-3 w-min-fit">
          <div className="flex flex-col">
            <div className="flex flex-row items-center">
              <div className="text-xs text-gray-500">Governance Cycle</div>
              <div className="ml-2 font-semibold">{currentCycle}</div>
            </div>
            <div className="flex flex-row items-center">
              <div className="text-xs text-gray-500">Current Event</div>
              <div className="ml-8 font-semibold text-sm">{currentEvent.title}</div>
            </div>
            <div className="flex justify-start items-center">
              <div className="text-xs text-gray-500">Time Remaining</div>
              <Tooltip content={formattedEndTime}>
                <div className="ml-5">
                  {remainingTime.split(" ").map((time, index) => (
                    <span key={index} className="font-mono">
                      {time}
                      <span className="text-xs font-normal text-gray-500">
                        {index === 0 ? "d " : index === 1 ? "h " : index === 2 ? "m " : "s"}
                      </span>
                    </span>
                  ))}
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
