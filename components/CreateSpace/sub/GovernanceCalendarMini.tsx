// https://github.com/samselikoff/2022-05-11-tailwind-ui-interactive-calendar
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
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
} from 'date-fns';
import { useEffect, useState } from 'react';

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

export default function GovernanceCalendarMini(
  { setSelectedDate, temperatureCheckLength, votingLength, executionLength, delayLength, totalCycleLength } :
  { setSelectedDate: any, temperatureCheckLength: number, votingLength: number, executionLength: number, delayLength: number, totalCycleLength: number }
) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  });

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  const FORWARD_INTERVALS = 10;

  const repeatDatesArray = (startDate: Date, lengthOfDates: number, repeatAfterNumberOfDays: number) => {
    let dates = [];
    for (let i = 0; i < FORWARD_INTERVALS; i++) {
      const start = add(startDate, { days: repeatAfterNumberOfDays * i });
      const end = add(start, { days: lengthOfDates });
      dates.push(...eachDayOfInterval({ start, end }));
    }
    return dates;
  };

  const votingStartDate = add(selectedDay, { days: temperatureCheckLength });
  const executionStartDate = add(votingStartDate, { days: votingLength });
  const delayStartDate = add(executionStartDate, { days: executionLength });

  const dateInRange = (date: Date, range: Date[]) => {
    return range.some((rangeDate) => isSameDay(date, rangeDate));
  };

  useEffect(() => {
    setSelectedDate(selectedDay);
  }, [selectedDay]);

  return (
    <div className="pt-4">
      <div className="rounded-lg bg-gray-100 p-4">
        <div className="flex items-center">
          <h2 className="flex-auto font-semibold text-gray-900">
            {format(firstDayCurrentMonth, 'MMMM yyyy')}
          </h2>
          <button
            type="button"
            onClick={previousMonth}
            className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Previous month</span>
            <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            onClick={nextMonth}
            type="button"
            className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Next month</span>
            <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-7 mt-5 text-xs leading-6 text-center text-gray-500">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>
        <div className="grid grid-cols-7 mt-2 text-sm">
          {days.map((day, dayIdx) => (
            <div
              key={day.toString()}
              className={classNames(dayIdx === 0 && colStartClasses[getDay(day)], 'py-1')}
            >
              <button
                type="button"
                onClick={() => setSelectedDay(day)}
                className={classNames(
                  isEqual(day, selectedDay) && 'text-gray-900',
                  !isEqual(day, selectedDay) && isToday(day) && 'text-blue-600',
                  !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) && 'text-gray-900',
                  !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) && 'text-gray-400',
                  !isEqual(day, selectedDay) && 'hover:bg-gray-200',
                  (isEqual(day, selectedDay) || isToday(day)) && 'font-semibold',
                  isEqual(day, selectedDay) && 'ring-2 ring-indigo-500',
                  dateInRange(day, repeatDatesArray(selectedDay, temperatureCheckLength, totalCycleLength)) && 'bg-red-200',
                  dateInRange(day, repeatDatesArray(votingStartDate, votingLength, totalCycleLength)) && 'bg-orange-200',
                  dateInRange(day, repeatDatesArray(executionStartDate, executionLength, totalCycleLength)) && 'bg-green-200',
                  dateInRange(day, repeatDatesArray(delayStartDate, delayLength, totalCycleLength)) && 'bg-blue-200',
                  'mx-auto flex h-9 w-9 items-center justify-center rounded-full'
                )}
              >
                <time dateTime={format(day, 'yyyy-MM-dd')}>
                  {format(day, 'd')}
                </time>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];
