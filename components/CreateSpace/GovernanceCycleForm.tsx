import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import TimePicker from "./sub/TimePicker";
import GovernanceCalendarKey from "./sub/GovernanceCalendarKey";
import GovernanceCalendarMini, {
  VOTE_PERIOD_COLOR,
} from "./sub/GovernanceCalendarMini";
import { classNames } from "@/utils/functions/tailwind";

export default function GovernanceCycleForm() {
  const { control, getValues, setValue, watch } = useFormContext();

  const temperatureCheckLength = watch("governanceCycleForm.temperatureCheckLength");
  const voteLength = watch("governanceCycleForm.voteLength");
  const executionLength = watch("governanceCycleForm.executionLength");
  const delayLength = watch("governanceCycleForm.delayLength");

  const totalCycleLength =
    temperatureCheckLength + voteLength + executionLength + delayLength;

  function mergeDayWithTime(day: Date) {
    const _hours = getValues("governanceCycleForm.time.hour");
    const ampm = getValues("governanceCycleForm.time.ampm");
    const hours = (ampm === "AM" ? _hours : _hours + 12) % 24;
    const minutes = getValues("governanceCycleForm.time.minute");
    if (_hours && minutes) {
      day.setHours(hours, minutes, 0, 0);
    }
    return day;
  }

  // update default startDate with current timePicker values
  //   after initial render while setValue will be available
  useEffect(() => {
    setValue("governanceCycleForm.startDate", mergeDayWithTime(new Date()));
  }, [setValue]);

  return (
    <div className="flex flex-col space-x-8 md:flex-row">
      <div className="mb-1 w-fit flex-col">
        <div className="inline-flex">
          <label className="mt-2 block text-sm font-medium text-gray-700">
            Select Start Date
          </label>
          <GovernanceCalendarKey />
        </div>

        <Controller
          name={"governanceCycleForm.startDate"}
          control={control}
          rules={{
            required: "Can't be empty",
          }}
          defaultValue={new Date()}
          render={({ field: { onChange, value } }) => (
            <GovernanceCalendarMini
              selectedDate={value}
              setSelectedDate={onChange}
              mergeDayWithTime={mergeDayWithTime}
              temperatureCheckLength={temperatureCheckLength}
              votingLength={voteLength}
              executionLength={executionLength}
              delayLength={delayLength}
              totalCycleLength={totalCycleLength}
            />
          )}
          shouldUnregister
        />
      </div>

      <div>
        <TimePicker mergeDayWithTime={mergeDayWithTime} />
        <SmallNumberInput
          label="Temperature Check Length"
          name="governanceCycleForm.temperatureCheckLength"
          defaultValue={3}
          tooltipContent="This is the length of time that a Discord Temperature Check is open for polling"
          badgeColor={VOTE_PERIOD_COLOR["tempCheck"]}
        />
        <SmallNumberInput
          label="Vote Length"
          name="governanceCycleForm.voteLength"
          defaultValue={4}
          tooltipContent="This is the length of time that a Snapshot vote is open"
          badgeColor={VOTE_PERIOD_COLOR["voting"]}
        />
        <SmallNumberInput
          label="Execution Length"
          name="governanceCycleForm.executionLength"
          defaultValue={4}
          tooltipContent="This is the length of time for the execution of proposals that pass Snapshot"
          badgeColor={VOTE_PERIOD_COLOR["execution"]}
        />
        <SmallNumberInput
          label="Delay Length"
          name="governanceCycleForm.delayLength"
          defaultValue={3}
          tooltipContent="This is the length of time between the end of execution and the start of the next Temperature Check"
          badgeColor={VOTE_PERIOD_COLOR["delay"]}
        />
        <div className="mt-2 inline-flex items-center rounded-md px-2 py-1">
          Total Days: {totalCycleLength}
        </div>
      </div>
    </div>
  );
}

const SmallNumberInput = ({
  label,
  name,
  defaultValue,
  tooltipContent,
  badgeColor = "bg-gray-100",
  badgeContent = "days",
}: {
  label: string;
  name: string;
  defaultValue: number;
  tooltipContent?: string;
  badgeColor?: string;
  badgeContent?: string;
}) => {
  const {
    register
  } = useFormContext();

  return (
    <div>
      <div className="my-2">
        <label className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <p className="text-xs text-gray-400 break-words">
          {tooltipContent}
        </p>
      </div>
      <div className="mt-1 flex">
        <div className="flex rounded-md border-gray-300 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-indigo-500 sm:text-sm">
          <input
            {...register(name, { shouldUnregister: true, valueAsNumber: true })}
            className="block h-7 w-16 rounded-md rounded-r-none border-gray-300 bg-white text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            type="number"
            min={1}
            defaultValue={defaultValue}
          ></input>
          <span
            className={classNames(
              "flex items-center rounded-l-none rounded-r-md border border-l-0 border-gray-300 px-2 text-xs text-gray-500",
              badgeColor,
            )}
          >
            {badgeContent}
          </span>
        </div>
      </div>
    </div>
  );
};
