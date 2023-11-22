import { formatDistanceToNowStrict, toDate } from "date-fns";
import { ClockIcon, PencilSquareIcon } from "@heroicons/react/24/solid";

interface VotingTimeIndicatorProps {
  /**
   * The start timestamp of the voting period, in seconds.
   */
  start: number;
  /**
   * The end timestamp of the voting period, in seconds.
   */
  end: number;
}

/**
 * An indicator that shows the time left before/for voting.
 * @param start The start timestamp of the voting period, in seconds.
 * @param end The end timestamp of the voting period, in seconds.
 */
export default function VotingTimeIndicator({
  start,
  end,
}: VotingTimeIndicatorProps) {
  const currentTime = Math.floor(Date.now() / 1000);
  const startLabel = formatDistanceToNowStrict(toDate(start * 1000), {
    addSuffix: true,
  });
  const endLabel = formatDistanceToNowStrict(toDate(end * 1000), {
    addSuffix: true,
  });

  if (currentTime < start) {
    return (
      <div className="flex place-items-center justify-center space-x-1 text-xs">
        <PencilSquareIcon className="h-3 w-3" />
        <p>{startLabel}</p>
      </div>
    );
  } else if (currentTime >= start && currentTime <= end) {
    return (
      <div className="flex place-items-center justify-center space-x-1 text-xs">
        <ClockIcon className="h-3 w-3" />
        <p>{endLabel}</p>
      </div>
    );
  } else {
    return null;
  }
}
