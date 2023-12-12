import { fromUnixTime, addDays, format } from "date-fns";

const FIRST_DAY = fromUnixTime(1626220800); // 2021-07-14T00:00:00.000Z
const CYCLE_LENGTH = 14; // days

export function dateRangesOfCycles(cycleStart: number, length: number) {
  if (!cycleStart || !length) return "";

  const startDate = addDays(FIRST_DAY, (cycleStart - 1) * CYCLE_LENGTH);
  const endDate = addDays(startDate, length * CYCLE_LENGTH);

  return `${format(startDate, "LLL dd, u")} - ${format(endDate, "LLL dd, u")}`;
}
