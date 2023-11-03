import { ErrorMessage } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import ToggleSwitch from "../common/ToggleSwitch";
import { useIsValidAddress } from "@/utils/hooks/SafeHooks";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/20/solid";

export default function GnosisSafeForm() {
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext();
  const fieldName = "config.juicebox.gnosisSafeAddress";

  const [gnosisSafeEnabled, setGnosisSafeEnabled] = useState(false);
  const [gnosisSafeAddress, setGnosisSafeAddress] = useState("");

  const { data: addressIsSafe, isLoading } = useIsValidAddress(
    gnosisSafeAddress,
    gnosisSafeEnabled &&
      gnosisSafeAddress.length === 42 &&
      gnosisSafeAddress.startsWith("0x"),
  );

  useEffect(() => {
    if (!gnosisSafeEnabled) setGnosisSafeAddress("");
  }, [gnosisSafeEnabled]);

  return (
    <div>
      <Controller
        name={fieldName}
        control={control}
        render={() => (
          <>
            <ToggleSwitch
              enabled={gnosisSafeEnabled}
              setEnabled={setGnosisSafeEnabled}
              label="Link to a Gnosis Safe?"
            />
            <div className="relative mb-2 mt-2 flex w-80 flex-col">
              <div className="pointer-events-none absolute inset-y-0 left-0 mt-1 flex items-center pl-3">
                {!addressIsSafe && !isLoading && gnosisSafeEnabled && (
                  <ExclamationCircleIcon
                    className={`h-5 w-5 ${
                      gnosisSafeAddress === ""
                        ? "text-gray-400"
                        : "text-red-400"
                    } aria-hidden="true"`}
                  />
                )}
                {addressIsSafe && gnosisSafeAddress !== "" && !isLoading && (
                  <CheckCircleIcon
                    className="h-5 w-5 text-green-400"
                    aria-hidden="true"
                  />
                )}
                {isLoading && (
                  <div
                    className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-current border-t-transparent text-gray-200"
                    role="status"
                    aria-label="loading"
                  ></div>
                )}
              </div>
              <input
                type="text"
                id={fieldName}
                name={fieldName}
                autoComplete="off"
                disabled={!gnosisSafeEnabled}
                className="mt-1 block rounded-md border-gray-300 pl-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 sm:text-sm"
                value={gnosisSafeAddress}
                onChange={(e) => {
                  setGnosisSafeAddress(e.target.value);
                  setValue(fieldName, e.target.value);
                }}
              />
            </div>
          </>
        )}
        shouldUnregister
      />
      <ErrorMessage
        errors={errors}
        name={fieldName}
        render={({ message }) => <p className="mt-1 text-red-500">{message}</p>}
      />
    </div>
  );
}
