import { Controller, useFormContext } from "react-hook-form";
import GovernanceCalendarMini from "./GovernanceCalendarMini";
import { useEffect } from "react";

export default function GovernanceCalendarMiniWrapped({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const { control, getValues, watch, setValue } = useFormContext();

  const temperatureCheckLength = watch(
    "governanceCycleForm.temperatureCheckLength",
  );
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
    <div className="w-fit">
      <Controller
        name={"governanceCycleForm.startDate"}
        control={control}
        rules={{
          required: "Can't be empty",
        }}
        defaultValue={new Date()}
        disabled={disabled}
        render={({ field: { onChange, value } }) => (
          <GovernanceCalendarMini
            selectedDate={value}
            setSelectedDate={disabled ? undefined : onChange}
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
  );
}
