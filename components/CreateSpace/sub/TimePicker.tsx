import { Controller, useFormContext } from "react-hook-form";
import SmallListbox from "@/components/common/SmallListBox";

const hours = Array.from(Array(12).keys()).map((i) => i + 1);
const minutes = ["00", "30"];
const ampm = ["AM", "PM"];

export default function TimePicker({
  mergeDayWithTime,
  disabled = false,
}: {
  mergeDayWithTime: (day: Date) => Date
  disabled?: boolean;
}) {
  const { control, setValue, getValues } = useFormContext();

  function updateSelectedDate() {
    setValue("governanceCycleForm.startDate", mergeDayWithTime(getValues("governanceCycleForm.startDate")));
  }

  return (
    <>
      <div className="my-2">
        <label
          htmlFor="time"
          className="block text-sm font-medium text-gray-700"
        >
          Select Start Time
        </label>
        <p className="text-xs text-gray-400 break-words">
          The time you progress to the next stage of governance (in your own timezone)
        </p>
      </div>
      <div className="inline-flex">
        <Controller
          name="governanceCycleForm.time.hour"
          control={control}
          defaultValue={7}
          render={({ field }) => (
            <SmallListbox
              options={hours}
              selected={field.value}
              setSelected={(v) => {
                field.onChange(v);
                updateSelectedDate();
              }}
              disabled={disabled}
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
              setSelected={(v) => {
                field.onChange(v);
                updateSelectedDate();
              }}
              disabled={disabled}
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
              setSelected={(v) => {
                field.onChange(v);
                updateSelectedDate();
              }}
              disabled={disabled}
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
