import { Transition, Dialog, Combobox } from "@headlessui/react";
import { Fragment } from "react";
import { classNames } from "../../../utils/functions/tailwind";
import { CurrencyDollarIcon, BoltIcon, ArrowsUpDownIcon, UserGroupIcon } from "@heroicons/react/24/solid";

export interface ActionItem {
  id: number;
  name: string;
  description: string;
  url: string;
  color: string;
  icon: any
}

const items: ActionItem[] = [
  {
    id: 1,
    name: 'Payout',
    description: 'Apply payouts from Juicebox treasury.',
    url: '#',
    color: 'bg-blue-500',
    icon: CurrencyDollarIcon,
  },
  {
    id: 2,
    name: 'Reserve',
    description: 'Apply to be added in reserved token list.',
    url: '#',
    color: 'bg-blue-500',
    icon: UserGroupIcon,
  },
  {
    id: 3,
    name: 'Transfer',
    description: 'Transfer tokens from Safe.',
    url: '#',
    color: 'bg-blue-500',
    icon: ArrowsUpDownIcon,
  },
  {
    id: 4,
    name: 'Custom Transaction',
    description: 'Execute custom transaction with Safe.',
    url: '#',
    color: 'bg-blue-500',
    icon: BoltIcon,
  },
  // More items...
];

export default function ActionPalettes({ open, setOpen, selectedAction, setSelectedAction }: any) {

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <Combobox value={selectedAction} onChange={setSelectedAction}>
                <Combobox.Options static className="max-h-96 scroll-py-3 overflow-y-auto p-3">
                  {items.map((item) => (
                    <Combobox.Option
                      key={item.id}
                      value={item}
                      className={({ active }) =>
                        classNames('flex cursor-default select-none rounded-xl p-3', active && 'bg-gray-100')
                      }
                    >
                      {({ active }) => (
                        <>
                          <div
                            className={classNames(
                              'flex h-10 w-10 flex-none items-center justify-center rounded-lg',
                              item.color
                            )}
                          >
                            <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                          </div>
                          <div className="ml-4 flex-auto">
                            <p
                              className={classNames(
                                'text-sm font-medium',
                                active ? 'text-gray-900' : 'text-gray-700'
                              )}
                            >
                              {item.name}
                            </p>
                            <p className={classNames('text-sm', active ? 'text-gray-700' : 'text-gray-500')}>
                              {item.description}
                            </p>
                          </div>
                        </>
                      )}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}