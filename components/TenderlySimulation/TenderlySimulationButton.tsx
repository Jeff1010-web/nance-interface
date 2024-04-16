import { Tooltip } from "flowbite-react";
import {
  TenderlySimulateArgs,
  TenderlySimulationAPIResponse,
  useTendelySimulate,
} from "@/utils/hooks/TenderlyHooks";
import { classNames } from "@/utils/functions/tailwind";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  CursorArrowRaysIcon,
} from "@heroicons/react/24/outline";
import { useEffect } from "react";

export default function TenderlySimulationButton({
  simulationArgs,
  shouldSimulate,
  setShouldSimulate,
  onSimulated,
}: {
  simulationArgs: TenderlySimulateArgs;
  shouldSimulate: boolean;
  setShouldSimulate: (shouldSimulate: boolean) => void;
  onSimulated?: (
    data: TenderlySimulationAPIResponse | undefined,
    shouldSimulate: boolean,
  ) => void;
}) {
  const { data, isLoading, error } = useTendelySimulate(
    simulationArgs,
    shouldSimulate,
  );

  useEffect(() => {
    onSimulated?.(data, shouldSimulate);
  }, [data, shouldSimulate, onSimulated]);

  return (
    <div className="isolate col-span-4 inline-flex rounded-md">
      <button
        type="button"
        className={classNames(
          "relative inline-flex items-center gap-x-1.5 rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300",
          shouldSimulate ? "" : "hover:bg-gray-50 focus:z-10",
        )}
        onClick={() => {
          if (shouldSimulate) {
            setShouldSimulate(false);
          }
          setShouldSimulate(true);
        }}
      >
        Simulate
      </button>
      <div className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
        {shouldSimulate ? (
          isLoading ? (
            <ArrowPathIcon
              className="-ml-0.5 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          ) : data?.simulation?.status ? (
            <CheckCircleIcon
              className="-ml-0.5 h-5 w-5 text-green-400"
              aria-hidden="true"
            />
          ) : (
            <Tooltip
              content={`Error: ${
                error
                  ? error.message
                  : data?.simulation?.error_message || "Not enough args"
              }`}
            >
              <XCircleIcon
                className="-ml-0.5 h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </Tooltip>
          )
        ) : (
          <CursorArrowRaysIcon
            className="-ml-0.5 h-5 w-5 text-blue-400"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
