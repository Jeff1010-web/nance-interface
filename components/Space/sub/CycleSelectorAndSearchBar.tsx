import SearchableComboBoxMultiple from "@/components/common/SearchableComboBoxMultiple";
import { useState } from "react";
import { Option } from "@/components/common/SearchableComboBox";

import { StringParam, useQueryParams, withDefault } from "next-query-params";
import SpaceAction from "./SpaceAction";
import {
  MagnifyingGlassIcon,
  AdjustmentsVerticalIcon,
} from "@heroicons/react/24/solid";

const allCycle = { id: "All", label: `All`, status: true };

function genOptions(currentCycle: number | undefined) {
  const newOptions: Option[] = [allCycle];
  if (currentCycle) {
    const nextCycle = currentCycle + 1;
    newOptions.push({
      id: `${nextCycle}`,
      label: `GC-${nextCycle} (Next)`,
      status: true,
    });
    newOptions.push({
      id: `${currentCycle}`,
      label: `GC-${currentCycle} (Current)`,
      status: true,
    });
    for (let i = currentCycle - 1; i >= 1; i--) {
      newOptions.push({ id: `${i}`, label: `GC-${i}`, status: false });
    }

    return newOptions;
  } else {
    return [{ id: "Loading", label: `Loading...`, status: true }];
  }
}

function genSelectedOptions(options: Option[], cycleParam: string | undefined) {
  if (cycleParam) {
    // cycle is 123 + 32 format
    const cycles = cycleParam.split("+");
    return cycles.map((c) => {
      const option = options.find((o) => o.id === c);
      return option || { id: c, label: `GC-${c}`, status: false };
    });
  } else {
    return [];
  }
}

export default function CycleSelectorAndSearchBar({
  currentCycle,
}: {
  currentCycle: number | undefined;
}) {
  const [query, setQuery] = useQueryParams({
    keyword: StringParam,
    cycle: withDefault(StringParam, currentCycle?.toString()),
  });
  const { keyword, cycle } = query;
  const options = genOptions(currentCycle);

  const [keywordInput, setKeywordInput] = useState<string>(keyword || "");

  return (
    <div className="flex flex-col space-y-2 md:flex-row md:justify-between">
      <div className="mt-1 flex grow" id="search-bar">
        <div className="relative flex flex-grow items-stretch focus-within:z-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="text"
            name="keyword"
            id="keyword"
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Search"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyUp={(e) => {
              // FIXME: use bouncing hook
              if (e.key == "Enter") {
                setQuery({
                  keyword: keywordInput,
                  cycle: "All",
                });
              }
            }}
          />
        </div>
      </div>

      <SpaceAction />
    </div>
  );
}
