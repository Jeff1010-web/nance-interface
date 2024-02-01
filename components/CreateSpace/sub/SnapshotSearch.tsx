import { useState } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";
import { classNames } from "@/utils/functions/tailwind";
import useSnapshotSearch from "@/utils/hooks/snapshot/SpaceSearch";
import { SpaceSearch } from "@/models/SnapshotTypes";
import useAddBotToSnapshot from "@/utils/hooks/snapshot/AddBotToSpace";
import Image from "next/image";
import { Session } from "next-auth";
import { Tooltip } from "flowbite-react";
import BasicFormattedCard from "@/components/common/BasicFormattedCard";

const canEditSnapshotSpace = (space: SpaceSearch, address: string) => {
  return space.admins.includes(address) || space.moderators.includes(address);
};

export default function SnapshotSearch({
  session,
  val,
  setVal,
}: {
  session: Session;
  val: string;
  setVal: (v: any) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<SpaceSearch | null>(null);

  const { data: spaces } = useSnapshotSearch(query);
  const { trigger, value, loading, reset } = useAddBotToSnapshot(
    selectedSpace ? selectedSpace.id : "",
  );

  return (
    <div>
      <div className="mt-2 block text-sm font-medium leading-6 text-gray-900">
        {" "}
        Select a snapshot.org space
      </div>
      {selectedSpace && (
        <BasicFormattedCard
          imgSrc={`https://cdn.stamp.fyi/space/${selectedSpace?.id}?s=160}`}
          imgAlt={selectedSpace?.name || ""}
          action={() => {
            setSelectedSpace(null);
            setVal("");
            reset();
          }}
        >
          {selectedSpace?.name}
        </BasicFormattedCard>
      )}
      {!selectedSpace && (
        <Combobox
          as="div"
          value={selectedSpace}
          onChange={(v: SpaceSearch) => {
            setSelectedSpace(v);
            setVal(v.id);
          }}
        >
          <div className="relative mt-2">
            <Combobox.Input
              className="rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
            />

            {spaces && spaces.length > 0 && (
              <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-fit overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {spaces.map((space) => (
                  <Combobox.Option
                    key={space.id}
                    value={space}
                    className={({ active }) =>
                      classNames(
                        active ? "bg-indigo-600 text-white" : "text-gray-900",
                        "relative cursor-default select-none py-2 pl-3 pr-9",
                      )
                    }
                  >
                    {({ active, selected }) => (
                      <>
                        <div className="flex items-center">
                          <Image
                            src={`https://cdn.stamp.fyi/space/${space.id}?s=160}`}
                            alt={space.name}
                            className="h-10 w-10 flex-shrink-0 rounded-full"
                            width={100}
                            height={100}
                          />
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "ml-3 block truncate",
                            )}
                          >
                            {space.id}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4",
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </div>
        </Combobox>
      )}
      {selectedSpace && selectedSpace.id && (
        <>
          <div className="mt-4">
            {(() => {
              const canUserEdit = canEditSnapshotSpace(
                selectedSpace,
                session?.user?.name?.toLowerCase() as string,
              );

              const addNanceSnapshotButton = (
                <button
                  type="button"
                  onClick={() => {
                    trigger();
                  }}
                  disabled={!canUserEdit || loading}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium leading-5 text-white hover:bg-indigo-500 focus:outline-none disabled:bg-gray-400"
                >
                  {loading && (
                    <>
                      <div
                        className="mr-2 inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-current border-t-transparent text-gray-200"
                        role="status"
                        aria-label="loading"
                      ></div>
                    </>
                  )}
                  Add Nance as author
                </button>
              );

              if (value) {
                // success, dont show button
                return null;
              }

              return canUserEdit ? (
                addNanceSnapshotButton
              ) : (
                <div className="w-fit">
                  <Tooltip
                    placement="top"
                    content="You must be a moderator or admin of this snapshot space to add nance as a member"
                  >
                    {addNanceSnapshotButton}
                  </Tooltip>
                </div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}
