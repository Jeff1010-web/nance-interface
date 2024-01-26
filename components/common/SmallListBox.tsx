import { classNames } from "@/utils/functions/tailwind";
import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function SmallListbox({
  options,
  selected,
  setSelected,
  addClass,
  disabled,
}: {
  options: string[] | number[];
  selected: string | number;
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  addClass?: string;
  disabled?: boolean;
}) {
  return (
    <Listbox value={selected} onChange={setSelected} disabled={disabled}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button
              className={`${addClass} relative flex w-12 cursor-default items-center justify-center rounded-md bg-white py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              <span className="flex">{selected}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center"></span>
            </Listbox.Button>
            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className={`${addClass} max-h-100 absolute mt-1 w-12 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
              >
                {options.map((o) => (
                  <Listbox.Option
                    key={o}
                    className={({ active }) =>
                      classNames(
                        active ? "bg-indigo-600 text-white" : "text-gray-900",
                        "relative cursor-default select-none rounded-md py-2 text-center",
                      )
                    }
                    value={o}
                  >
                    {o}
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
