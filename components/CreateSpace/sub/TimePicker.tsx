import { Tooltip } from "flowbite-react";
import { Controller, useFormContext } from "react-hook-form";
import SmallListbox from "@/components/common/SmallListBox";

const hours = Array.from(Array(12).keys()).map((i) => i);
const minutes = ["00", "30"];
const ampm = ["AM", "PM"];

export default function TimePicker() {
  const { control } = useFormContext();

  return (
    <>
      <div className="mb-2 mt-2 flex w-80">
        <label
          htmlFor="time"
          className="mt-2 block text-sm font-medium text-gray-700"
        >
          Select Start Time
        </label>
        <div className="ml-1 mt-1">
          <Tooltip content="The time you progress to the next stage of governance (in your own timezone)">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-400 text-xs text-white">
              ?
            </span>
          </Tooltip>
        </div>
      </div>
      <div className="inline-flex">
        <Controller
          name="governanceCycleForm.time.hour"
          control={control}
          defaultValue={8}
          render={({ field }) => (
            <SmallListbox
              options={hours}
              selected={field.value}
              setSelected={field.onChange}
            />
          )}
        />
        <div className="ml-2 mt-2 text-center font-semibold text-gray-900">
          :
        </div>
        <Controller
          name="governanceCycleForm.time.minute"
          control={control}
          defaultValue={minutes[0]}
          render={({ field }) => (
            <SmallListbox
              options={minutes}
              selected={field.value}
              setSelected={field.onChange}
              addClass="ml-2"
            />
          )}
        />
        <Controller
          name="governanceCycleForm.time.ampm"
          control={control}
          defaultValue={ampm[1]}
          render={({ field }) => (
            <SmallListbox
              options={ampm}
              selected={field.value}
              setSelected={field.onChange}
              addClass="ml-2"
            />
          )}
        />
        <Controller
          name="governanceCycleForm.time.timezoneOffset"
          defaultValue={new Date().getTimezoneOffset()}
          control={control}
          render={({ field }) => <input type="hidden" {...field} />}
        />
      </div>
    </>
  );
}
