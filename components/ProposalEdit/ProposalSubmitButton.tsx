import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
  ArrowPathIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { ProposalStatus } from "@/constants/Nance";
import { classNames } from "@/utils/functions/tailwind";

type ProposalStatusType = typeof ProposalStatus[number];

export function ProposalSubmitButton({
  formErrors,
  status,
  isMutating,
  selected,
  setSelected 
} : {
  formErrors: string,
  status: string,
  isMutating: boolean,
  selected: ProposalStatusType,
  setSelected: (id: ProposalStatusType) => void
}) {
  
  function getButtonLabel(selected: {
    title: string;
    description: string;
    value: string;
    display: string;
  }) {
  
    if (formErrors.length > 0) {
      return "Error in form";
    } else if (status === "loading") {
      return "Connecting...";
    } else if (isMutating) {
      return "Submitting...";
    } else {
      return selected.display;
    }
  }

  return (
    <Listbox value={selected} onChange={setSelected} as="div">
      {({ open }) => (
        <>
          <Listbox.Label className="sr-only">
          Change published status
          </Listbox.Label>
          <div className="relative">
            <div className="inline-flex divide-x divide-blue-700 rounded-md shadow-sm">
              <button
                type="submit"
                disabled={
                  isMutating || formErrors.length > 0
                //|| (!isNew && hasVoting)
                }
                className="ml-3 inline-flex justify-center rounded-none rounded-l-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
              >
                {(status === "loading" || isMutating) && (
                  <ArrowPathIcon
                    className="mr-1 h-5 w-5 animate-spin text-white"
                    aria-hidden="true"
                  />
                )}
                {getButtonLabel(selected)}
              </button>
              <Listbox.Button className="inline-flex items-center rounded-l-none rounded-r-md bg-blue-600 p-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-50">
                <span className="sr-only">Change proposal status</span>
                <ChevronDownIcon
                  className="h-5 w-5 text-white"
                  aria-hidden="true"
                />
              </Listbox.Button>
            </div>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute right-0 z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {ProposalStatus.map((option) => (
                  <Listbox.Option
                    key={option.title}
                    className={({ active }) =>
                      classNames(
                        active
                          ? "bg-blue-600 text-white"
                          : "text-gray-900",
                        "cursor-default select-none p-4 text-sm",
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <div className="flex flex-col">
                        <div className="flex justify-between">
                          <p
                            className={
                              selected ? "font-semibold" : "font-normal"
                            }
                          >
                            {option.title}
                          </p>
                          {selected ? (
                            <span
                              className={
                                active ? "text-white" : "text-blue-600"
                              }
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={classNames(
                            active ? "text-blue-200" : "text-gray-500",
                            "mt-2",
                          )}
                        >
                          {option.description}
                        </p>
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}