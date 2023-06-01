import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { useQueryParams, StringParam, withDefault, BooleanParam, NumberParam } from "next-query-params";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSpaceInfo, useProposals } from "../../hooks/NanceHooks";
import ScrollToBottom from "../ScrollToBottom";
import SearchableComboBox, { Option } from "../SearchableComboBox";
import ProposalCards from "./ProposalCards";
import { getLastSlash } from "../../libs/nance";

export default function NanceSpace({ space, proposalUrlPrefix = "/p/" }: { space: string, proposalUrlPrefix?: string }) {
    // State
    const [cycleOption, setCycleOption] = useState<Option>(undefined);
    const [options, setOptions] = useState<Option[]>([{ id: "Loading", label: `Loading...`, status: true }]);
    const [keywordInput, setKeywordInput] = useState<string>(undefined);
    // QueryParams
    const router = useRouter();
    const [query, setQuery] = useQueryParams({
      keyword: StringParam,
      //limit: NumberParam,
      sortBy: withDefault(StringParam, 'status'),
      sortDesc: withDefault(BooleanParam, true),
      cycle: NumberParam
    });
    const { keyword, cycle } = query;
  
    // External Hooks
    const { data: infoData, isLoading: infoLoading, error: infoError } = useSpaceInfo({ space }, router.isReady);
    const { data: proposalData, isLoading: proposalsLoading, error: proposalError } = useProposals({ space, cycle, keyword }, router.isReady);
    const currentCycle = cycle || infoData?.data?.currentCycle;
    const allCycle = { id: "All", label: `All`, status: true };
    
    // Data process
    let remainingTime = "-";
    try {
      remainingTime = formatDistanceToNowStrict(parseISO(infoData?.data?.currentEvent?.end));
    } catch (error) {
      //console.warn("🔴 Nance.formatDistanceToNowStrict ->", error);
    }
  
    // Effects to sync UI
    useEffect(() => {
      // if we can retrieve the current cycle from infoData, then we can populate the options
      const _currentCycle = infoData?.data?.currentCycle;
      const newOptions: Option[] = [];
      if (_currentCycle) {
        newOptions.push(allCycle);
        const nextCycle = _currentCycle + 1;
        newOptions.push({ id: `${nextCycle}`, label: `GC-${nextCycle} (Next)`, status: true });
        newOptions.push({ id: `${_currentCycle}`, label: `GC-${_currentCycle} (Current)`, status: true });
        for (let i = _currentCycle - 1; i >= 1; i--) {
          newOptions.push({ id: `${i}`, label: `GC-${i}`, status: false });
        }
  
        setOptions(newOptions);
      }
    }, [infoData]);
    // sync cycle option with the query params
    useEffect(() => {
      if (keyword && !cycle) {
        // if there is a keyword but no cycle, then we should set the cycle to "All"
        setCycleOption(allCycle);
      } else {
        setCycleOption(options.find(o => o.id === `${currentCycle}`));
      }
    }, [keyword, cycle, options]);
    // sync keyword input with the query params
    useEffect(() => {
      if (keyword != keywordInput) {
        setKeywordInput(keyword);
      }
    }, [keyword]);
  
    return (
      <div className="m-4 lg:m-6 flex justify-center lg:px-20">
          <div className="flex flex-col max-w-7xl w-full">
  
            {/* Page header */}
            <div className="max-w-7xl md:flex md:space-x-5 bg-white p-6 shadow rounded-md">
              <div className="flex flex-col space-x-0 space-y-6 items-center md:flex-row md:justify-between md:space-x-6 md:space-y-0 w-full">
                <div className="flex-shrink-0 md:w-5/12 flex space-x-3">
                  <img
                    className="h-16 w-16 rounded-full"
                    src={`https://cdn.stamp.fyi/space/${infoData?.data?.snapshotSpace}?s=160`}
                    alt={`${space} Logo`}
                  />
  
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">{space}</h1>
                    <p className="text-sm font-medium text-gray-500 text-right">powered by Nance</p>
                  </div>
                </div>
  
                <div className="break-words p-2 md:w-2/12 text-center rounded-md border-2 border-blue-600 bg-indigo-100">
                  <a className="text-2xl font-semibold text-gray-900"
                    href="https://info.juicebox.money/dao/process/" target="_blank" rel="noopener noreferrer">
                    {infoData?.data?.currentEvent?.title || "Unknown"} of GC{infoData?.data?.currentCycle}
                  </a>
                  <p className="text-sm font-medium text-gray-500">{remainingTime} remaining</p>
                </div>
              </div>
            </div>
  
            <div className="flex mt-6 flex-col space-y-2 md:justify-between md:flex-row md:space-x-4 md:space-y-0">
              <div className="md:w-1/5">
                <SearchableComboBox val={cycleOption} setVal={(o) => {
                  let opt = o as Option;
                  setCycleOption(opt);
                  // sync with cycle parameter
                  setQuery({
                    cycle: parseInt(opt.id)
                  })
                }} options={options} label="Select cycle" />
              </div>
  
              {/* Search bar and limit */}
              <div className="md:w-4/5">
                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">
                  Search proposals
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex flex-grow items-stretch focus-within:z-10">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <DocumentMagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="keyword"
                      id="keyword"
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="grant, swap and payout etc."
                      value={keywordInput !== undefined ? keywordInput : keyword}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyUp={(e) => {
                        if (e.key == "Enter") {
                          setQuery({
                            keyword: keywordInput
                          })
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
  
            </div>
  
            <div className="">
              <ProposalCards proposalUrlPrefix={proposalUrlPrefix} loading={infoLoading || proposalsLoading} proposalsPacket={proposalData?.data} query={query} setQuery={setQuery} maxCycle={(infoData?.data?.currentCycle ?? 0) + 1} />
            </div>
  
            <div className="mt-6 text-center">
              {proposalData?.data?.proposals.length > 0 && `Total Proposals: ${proposalData?.data?.proposals.length}`}
            </div>

            <div className="mt-2 text-center">
              {infoData?.data?.dolthubLink && (
                <p className="text-center text-xs text-gray-500">
                  ∴ dolt commit <a href={infoData?.data?.dolthubLink} target="_blank" rel="noopener noreferrer">{getLastSlash(infoData?.data?.dolthubLink)?.slice(0, 7)}</a>
                </p>
              )}
            </div>
  
            <ScrollToBottom />
          </div>
        </div>
    )
  }