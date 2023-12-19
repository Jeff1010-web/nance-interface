// https://github.com/samselikoff/2022-05-11-tailwind-ui-interactive-calendar
import { classNames } from "@/utils/functions/tailwind";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  endOfWeek,
  getHours,
  differenceInDays
} from "date-fns";
import { useState } from "react";

export default function GovernanceCalendarMini({
  selectedDate,
  setSelectedDate,
  mergeDayWithTime,
  temperatureCheckLength,
  votingLength,
  executionLength,
  delayLength,
  totalCycleLength,
}: {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  mergeDayWithTime: (day: Date) => Date;
  temperatureCheckLength: number;
  votingLength: number;
  executionLength: number;
  delayLength: number;
  totalCycleLength: number;
}) {
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  }).map(day => mergeDayWithTime(day));

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  const votingIdx = temperatureCheckLength + 1;
  const executionIdx = temperatureCheckLength + votingLength + 1;
  const delayIdx = temperatureCheckLength + votingLength + executionLength + 1;
  const fullDayInStage = getHours(selectedDate) === 0;

  const daysWithStageColor = days?.map((day, index) => {
    let bgColor = "";
    const diff = differenceInDays(day, selectedDate);
    let dayIdxInCycle = diff % totalCycleLength + 1;
    if (diff < 0) {
      dayIdxInCycle += totalCycleLength;
    } else {
      // add background color to indicate stage
      if (dayIdxInCycle < votingIdx && dayIdxInCycle >= 1) {
        bgColor = VOTE_PERIOD_COLOR["tempCheck"];
      } else if (dayIdxInCycle < executionIdx && dayIdxInCycle >= votingIdx) {
        bgColor = VOTE_PERIOD_COLOR["voting"];
      } else if (dayIdxInCycle < delayIdx && dayIdxInCycle >= executionIdx) {
        bgColor = VOTE_PERIOD_COLOR["execution"];
      } else if (dayIdxInCycle <= totalCycleLength && dayIdxInCycle >= delayIdx) {
        bgColor = VOTE_PERIOD_COLOR["delay"];
      }

      // add gradient color if not fullDayInStage
      if (!fullDayInStage) {
        if (isSameDay(day, selectedDate)) {
          bgColor = VOTE_PERIOD_COLOR["emptyToTempCheck"];
        } else if (dayIdxInCycle === 1) {
          bgColor = VOTE_PERIOD_COLOR["delayToTempCheck"];
        } else if (dayIdxInCycle === votingIdx) {
          bgColor = VOTE_PERIOD_COLOR["tempCheckToVoting"];
        } else if (dayIdxInCycle === executionIdx) {
          bgColor = VOTE_PERIOD_COLOR["votingToExecution"];
        } else if (dayIdxInCycle === delayIdx) {
          bgColor = VOTE_PERIOD_COLOR["executionToDelay"];
        }
      }
    }

    return {
      day, dayIdxInCycle, bgColor
    };
  });

  return (
    <div className="pt-4">
      <div className="rounded-lg bg-gray-100 p-4">
        <div className="flex items-center">
          <h2 className="flex-auto font-semibold text-gray-900">
            {format(firstDayCurrentMonth, "MMMM yyyy")}
          </h2>
          <button
            type="button"
            onClick={previousMonth}
            className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Previous month</span>
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            onClick={nextMonth}
            type="button"
            className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Next month</span>
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-5 grid grid-cols-7 text-center text-xs leading-6 text-gray-500">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>
        <div className="mt-2 grid grid-cols-7 text-sm">
          {daysWithStageColor.map((dayWSC, dayIdx) => (
            <div
              key={dayWSC.day.toString()}
              className={classNames(
                dayIdx === 0 && colStartClasses[getDay(dayWSC.day)],
                "py-1",
              )}
            >
              <button
                type="button"
                onClick={() => setSelectedDate(dayWSC.day)}
                className={classNames(
                  // highlight selected status
                  isSameDay(dayWSC.day, selectedDate) &&
                    "italic font-semibold text-gray-900",
                  !isSameDay(dayWSC.day, selectedDate) &&
                    isToday(dayWSC.day) &&
                    "text-blue-600",
                  !isSameDay(dayWSC.day, selectedDate) &&
                    !isToday(dayWSC.day) &&
                    isSameMonth(dayWSC.day, firstDayCurrentMonth) &&
                    "text-gray-900",
                  !isSameDay(dayWSC.day, selectedDate) &&
                    !isToday(dayWSC.day) &&
                    !isSameMonth(dayWSC.day, firstDayCurrentMonth) &&
                    "text-gray-400",
                  !isSameDay(dayWSC.day, selectedDate) && "hover:bg-gray-200 hover:from-gray-200",
                  isToday(dayWSC.day) && "font-semibold",
                  // colored background for stages
                  dayWSC.bgColor,
                  "mx-auto flex h-9 w-9 items-center justify-center",
                )}
              >
                <time dateTime={format(dayWSC.day, "yyyy-MM-dd")}>
                  {format(dayWSC.day, "d")}
                </time>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const VOTE_PERIOD_COLOR = {
  emptyToTempCheck: "bg-gradient-to-r from-gray-100 to-red-200",
  tempCheck: "bg-red-200",
  tempCheckToVoting: "bg-gradient-to-r from-red-200 to-orange-200",
  voting: "bg-orange-200",
  votingToExecution: "bg-gradient-to-r from-orange-200 to-green-200",
  execution: "bg-green-200",
  executionToDelay: "bg-gradient-to-r from-green-200 to-blue-200",
  delay: "bg-blue-200",
  delayToTempCheck: "bg-gradient-to-r from-blue-200 to-red-200",
  delayToEmpty: "bg-gradient-to-r from-blue-200 to-gray-100",
};

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];
