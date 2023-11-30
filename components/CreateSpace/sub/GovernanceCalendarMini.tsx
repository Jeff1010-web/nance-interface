// https://github.com/samselikoff/2022-05-11-tailwind-ui-interactive-calendar
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  endOfWeek,
} from "date-fns";
import { useEffect, useState } from "react";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function GovernanceCalendarMini({
  selectedDate,
  setSelectedDate,
  temperatureCheckLength,
  votingLength,
  executionLength,
  delayLength,
  totalCycleLength,
}: {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
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
  });

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  const FORWARD_INTERVALS = Math.ceil(31 / totalCycleLength);

  const repeatDatesArray = (
    startDate: Date,
    lengthOfDates: number,
    repeatAfterNumberOfDays: number,
  ) => {
    let dates = [];
    for (let i = 0; i < FORWARD_INTERVALS; i++) {
      const start = add(startDate, { days: repeatAfterNumberOfDays * i });
      const end = add(start, { days: lengthOfDates });
      dates.push(...eachDayOfInterval({ start, end }));
    }
    return dates;
  };

  const temperatureCheckDates = repeatDatesArray(
    selectedDate,
    temperatureCheckLength,
    totalCycleLength,
  );
  const votingStartDate = add(selectedDate, { days: temperatureCheckLength });
  const votingDates = repeatDatesArray(
    votingStartDate,
    votingLength,
    totalCycleLength,
  );
  const executionStartDate = add(votingStartDate, { days: votingLength });
  const executionDates = repeatDatesArray(
    executionStartDate,
    executionLength,
    totalCycleLength,
  );
  const delayStartDate = add(executionStartDate, { days: executionLength });
  const delayDates = repeatDatesArray(
    delayStartDate,
    delayLength,
    totalCycleLength,
  );

  const dateInRange = (date: Date, range: Date[]) => {
    return range.some((rangeDate) => isSameDay(date, rangeDate));
  };

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
          {days.map((day, dayIdx) => (
            <div
              key={day.toString()}
              className={classNames(
                dayIdx === 0 && colStartClasses[getDay(day)],
                "py-1",
              )}
            >
              <button
                type="button"
                onClick={() => setSelectedDate(day)}
                className={classNames(
                  isEqual(day, selectedDate) &&
                    "font-semibold text-gray-900 ring-2 ring-indigo-500",
                  !isEqual(day, selectedDate) &&
                    isToday(day) &&
                    "text-blue-600",
                  !isEqual(day, selectedDate) &&
                    !isToday(day) &&
                    isSameMonth(day, firstDayCurrentMonth) &&
                    "text-gray-900",
                  !isEqual(day, selectedDate) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    "text-gray-400",
                  !isEqual(day, selectedDate) && "hover:bg-gray-200",
                  isToday(day) && "font-semibold",
                  dateInRange(day, temperatureCheckDates) &&
                    VOTE_PERIOD_COLOR["tempCheck"],
                  dateInRange(day, votingDates) && VOTE_PERIOD_COLOR["voting"],
                  dateInRange(day, executionDates) &&
                    VOTE_PERIOD_COLOR["execution"],
                  dateInRange(day, delayDates) && VOTE_PERIOD_COLOR["delay"],
                  "mx-auto flex h-9 w-9 items-center justify-center rounded-full",
                )}
              >
                <time dateTime={format(day, "yyyy-MM-dd")}>
                  {format(day, "d")}
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
  tempCheck: "bg-gray-200",
  voting: "bg-green-200",
  execution: "bg-red-200",
  delay: "bg-orange-200",
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
