import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Tooltip } from "flowbite-react";
import GovernanceCalendarMini from '../GovernanceCalendarMini';
import GovernanceCalendarKey from "../GovernanceCalendarKey";
import TimePicker from "../TimePicker";

export default function GovernanceCyleForm() {
  const { register, formState: { errors }, setValue } = useFormContext();

  const [temperatureCheckLength, setTemperatureCheckLength] = useState(3);
  const [voteLength, setVoteLength] = useState(4);
  const [executionLength, setExecutionLength] = useState(4);
  const [delayLength, setDelayLength] = useState(3);
  const [totalCycleLength, setTotalCycleLength] = useState(14);
  const [startDate, setStartDate] = useState(new Date());

  useEffect(() => {
    setTotalCycleLength(Number(temperatureCheckLength) + Number(voteLength) + Number(executionLength) + Number(delayLength));
    setValue('governanceCycleForm.startDate', startDate);
  }, [temperatureCheckLength, voteLength, executionLength, delayLength, startDate]);

  return (
    <div>
      <TimePicker />
      <SmallNumberInput
        label="Temperature Check Length"
        name="governanceCycleForm.temperatureCheckLength"
        defaultValue={3}
        tooltipContent="This is the length of time that a Discord Temperature Check is open for polling"
        register={register}
        onChange={setTemperatureCheckLength}
      />
      <SmallNumberInput
        label="Vote Length"
        name="governanceCycleForm.voteLength"
        defaultValue={4}
        tooltipContent="This is the length of time that a Snapshot vote is open"
        register={register}
        onChange={setVoteLength}
      />
      <SmallNumberInput
        label="Execution Length"
        name="governanceCycleForm.executionLength"
        defaultValue={4}
        tooltipContent="This is the length of time for the execution of proposals that pass Snapshot"
        register={register}
        onChange={setExecutionLength}
      />
      <SmallNumberInput
        label="Delay Length"
        name="governanceCycleForm.delayLength"
        defaultValue={3}
        tooltipContent="This is the length of time between the end of execution and the start of the next Temperature Check"
        register={register}
        onChange={setDelayLength}
      />
      <div className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 font-medium text-blue-600 mt-2">
        Total Days: {totalCycleLength}
      </div>
      <div className="flex-col mb-1 w-80">
        <div className="inline-flex">
          <label className="block text-sm font-medium text-gray-700 mt-2">
            Select Start Date
          </label>
          <GovernanceCalendarKey />
        </div>
        <input
          type="hidden"
          {...register('governanceCycleForm.startDate')}
          value={startDate.toISOString()}
        />
        <GovernanceCalendarMini
          setSelectedDate={setStartDate}
          temperatureCheckLength={temperatureCheckLength}
          votingLength={voteLength}
          executionLength={executionLength}
          delayLength={delayLength}
          totalCycleLength={totalCycleLength}
        />
      </div>
    </div>
  );
}

const SmallNumberInput = ({
  label, name, register, defaultValue, tooltipContent, className, badgeContent='days', onChange } :
  {label: string, name: string, register: any, defaultValue: number, tooltipContent?: string, className?: string, badgeContent?: string, onChange?: any
  }) => {
  return (
    <div>
      <div className="flex mb-2 mt-2 w-80">
        <label className="block text-sm font-medium text-gray-700 mt-2">
          {label}
        </label>
        {tooltipContent && (
          <div className="ml-1 mt-1">
            <Tooltip content={tooltipContent}>
              <span className="inline-flex items-center justify-center h-4 w-4 text-xs rounded-full bg-gray-400 text-white">?</span>
            </Tooltip>
          </div>
        )}
      </div>
      <div className="mt-1 flex">
        <div className="flex rounded-md border-gray-300 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-indigo-500 sm:text-sm">
          <input
            {...register(name,
              { shouldUnregister: true })}
            className="block w-16 rounded-md rounded-r-none border-gray-300 bg-white h-7 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-xs"
            type="number"
            min={0}
            defaultValue={defaultValue}
            onChange={(e) => {
              onChange(e.target.value);
            }}
          >
          </input>
          <span className="flex items-center px-2 text-xs text-gray-500 bg-gray-100 rounded-l-none rounded-r-md border border-l-0 border-gray-300">
            {badgeContent}
          </span>
        </div>
      </div>
    </div>
  );
};