import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { useFormContext } from 'react-hook-form';

export default function GovernanceCalendarKey() {
  return (
    <Menu as="div" className="relative inline-block text-left mt-2 ml-3">
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
        <Menu.Items className="absolute right-0 maxh-50 mt-2 w-56 origin-top-right rounded-md bg-gray-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-3 ml-4">
            <Menu.Item>
              <div className="flex flex-row">
                <div className="mb-2 h-9 w-9 rounded-full bg-red-200" />
                <div className="text-sm text-gray-900 mt-2 ml-2">Temperature Check</div>
              </div>
            </Menu.Item>
            <Menu.Item>
              <div className="flex flex-row">
                <div className="mb-2 h-9 w-9 rounded-full bg-orange-200" />
                <div className="text-sm text-gray-900 mt-2 ml-2">Voting</div>
              </div>
            </Menu.Item>
            <Menu.Item>
              <div className="flex flex-row">
                <div className="mb-2 h-9 w-9 rounded-full bg-green-200" />
                <div className="text-sm text-gray-900 mt-2 ml-2">Execution</div>
              </div>
            </Menu.Item>
            <Menu.Item>
              <div className="flex flex-row">
                <div className="mb-2 h-9 w-9 rounded-full bg-blue-200" />
                <div className="text-sm text-gray-900 mt-2 ml-2">Delay</div>
              </div>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
