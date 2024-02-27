import { addDays, format } from "date-fns";

const CYCLE_LENGTH = 14; // days

export function dateRangesOfCycles({
  cycle,
  length,
  currentCycle,
  cycleStartDate: currentCycleStartDate,
}: {
  cycle?: number;
  length?: number;
  currentCycle?: number;
  cycleStartDate?: string;
}) {
  if (!cycle || !currentCycleStartDate || !length || !currentCycle) return "";

  const startDate = addDays(new Date(currentCycleStartDate), (cycle - currentCycle) * CYCLE_LENGTH);
  const endDate = addDays(startDate, length * CYCLE_LENGTH);

  return `${format(startDate, "LLL dd, u")} - ${format(endDate, "LLL dd, u")}`;
}
