import { Fragment, PropsWithChildren } from "react";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

interface MenuEntry {
  name: string;
  description: string;
  href: string;
  onClick?: () => void;
  icon: any;
}

interface Props {
  label: string;
  entries: MenuEntry[];
  callToActions?: Omit<MenuEntry, "description">[];
  overridePanelClassName?: string;
}

export default function FlyoutMenu({
  label,
  entries,
  callToActions,
  overridePanelClassName = "absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4",
}: Props) {
  return (
    <Popover className="relative">
      <Popover.Button className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900">
        <span>{label}</span>
        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className={overridePanelClassName}>
          <div className="w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
            <div className="p-4">
              {entries.map((item) => (
                <div
                  key={item.name}
                  className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                    <item.icon
                      className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <Entry entry={item}>
                      {item.name}
                      <span className="absolute inset-0" />
                    </Entry>
                    <p className="mt-1 text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
              {callToActions?.map((item) => (
                <CallToAction key={item.name} entry={item}>
                  <item.icon
                    className="h-5 w-5 flex-none text-gray-400"
                    aria-hidden="true"
                  />
                  {item.name}
                </CallToAction>
              ))}
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}

function Entry({ entry, children }: PropsWithChildren<{ entry: MenuEntry }>) {
  if (entry.onClick) {
    return (
      <Popover.Button
        onClick={entry.onClick}
        className="font-semibold text-gray-900"
      >
        {children}
      </Popover.Button>
    );
  }

  return (
    <a href={entry.href} className="font-semibold text-gray-900">
      {children}
    </a>
  );
}

function CallToAction({
  entry,
  children,
}: PropsWithChildren<{ entry: Omit<MenuEntry, "description"> }>) {
  if (entry.onClick) {
    return (
      <Popover.Button
        onClick={entry.onClick}
        className="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-gray-900 hover:bg-gray-100"
      >
        {children}
      </Popover.Button>
    );
  }

  return (
    <a
      href={entry.href}
      className="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-gray-900 hover:bg-gray-100"
    >
      {children}
    </a>
  );
}
