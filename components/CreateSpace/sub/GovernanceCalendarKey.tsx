import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { classNames } from "@/utils/functions/tailwind";
import { VOTE_PERIOD_COLOR } from "./GovernanceCalendarMini";

export default function GovernanceCalendarKey() {
  return (
    <Menu as="div" className="relative ml-3 mt-2 inline-block text-left">
      <div>
        <Menu.Button className="flex items-center rounded-full bg-gray-200 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          <span className="sr-only">Open options</span>
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="maxh-50 absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-gray-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="ml-4 py-3">
            <Menu.Item>
              <div className="flex flex-row">
                <div
                  className={classNames(
                    "mb-2 h-9 w-9 rounded-full",
                    VOTE_PERIOD_COLOR["tempCheck"],
                  )}
                />
                <div className="ml-2 mt-2 text-sm text-gray-900">
                  Temperature Check
                </div>
              </div>
            </Menu.Item>
            <Menu.Item>
              <div className="flex flex-row">
                <div
                  className={classNames(
                    "mb-2 h-9 w-9 rounded-full",
                    VOTE_PERIOD_COLOR["voting"],
                  )}
                />
                <div className="ml-2 mt-2 text-sm text-gray-900">Voting</div>
              </div>
            </Menu.Item>
            <Menu.Item>
              <div className="flex flex-row">
                <div
                  className={classNames(
                    "mb-2 h-9 w-9 rounded-full",
                    VOTE_PERIOD_COLOR["execution"],
                  )}
                />
                <div className="ml-2 mt-2 text-sm text-gray-900">Execution</div>
              </div>
            </Menu.Item>
            <Menu.Item>
              <div className="flex flex-row">
                <div
                  className={classNames(
                    "mb-2 h-9 w-9 rounded-full",
                    VOTE_PERIOD_COLOR["delay"],
                  )}
                />
                <div className="ml-2 mt-2 text-sm text-gray-900">Delay</div>
              </div>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
