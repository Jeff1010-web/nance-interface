import { useState } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";
import { classNames } from "@/utils/functions/tailwind";
import Image from "next/image";
import BasicFormattedCard from "@/components/common/BasicFormattedCard";
import { Guild, useGuildSearch } from "@/utils/hooks/GuildxyzHooks";
import { useDebounce } from "@/utils/hooks/UseDebounce";

export default function GuildxyzSearch({
  val,
  setVal,
}: {
  val: string;
  setVal: (v: any) => void;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);

  const { data: guilds } = useGuildSearch(
    debouncedQuery,
    10,
    0,
    debouncedQuery.length > 0,
  );

  useDebounce(query, 300, (q) => {
    setDebouncedQuery(q);
  });

  return (
    <div>
      <div className="mt-2 block text-sm font-medium leading-6 text-gray-900">
        {" "}
        Select a guild.xyz guild
      </div>
      {selectedGuild && (
        <BasicFormattedCard
          imgSrc={selectedGuild.imageUrl}
          imgAlt={selectedGuild?.name || ""}
          action={() => {
            setSelectedGuild(null);
            setVal("");
          }}
        >
          {selectedGuild?.name}
        </BasicFormattedCard>
      )}
      {!selectedGuild && (
        <Combobox
          as="div"
          value={selectedGuild}
          onChange={(v: Guild) => {
            setSelectedGuild(v);
            setVal(v.id);
          }}
        >
          <div className="relative mt-2">
            <Combobox.Input
              className="rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
            />

            {guilds && guilds.length > 0 && (
              <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-fit overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {guilds.map((guild) => (
                  <Combobox.Option
                    key={guild.id}
                    value={guild}
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
                            src={guild.imageUrl}
                            alt={guild.name}
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
                            {guild.name}
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
    </div>
  );
}
