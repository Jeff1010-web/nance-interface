import Link from "next/link"
import SiteNav from "../components/SiteNav"
import { formatDistanceToNowStrict, parseISO } from "date-fns"
import { NumberParam, useQueryParams, StringParam } from "next-query-params"
import { useRouter } from "next/router"
import { getLastSlash } from "../libs/nance"
import { useProposals, useSpaceInfo } from "../hooks/NanceHooks"
import { Proposal } from "../models/NanceTypes"
import useTotalSupplyOfProject from "../hooks/juicebox/TotalSupplyOfProject"
import { formatTokenBalance } from "../libs/NumberFormatter"
import useSnapshotSpaceInfo from "../hooks/snapshot/SpaceInfo"
import { useEffect, useState } from "react"
import { DocumentSearchIcon } from '@heroicons/react/solid'
import SearchableComboBox, { Option } from "../components/SearchableComboBox"
import { NANCE_DEFAULT_SPACE } from "../constants/Nance"
import ColorBar from "../components/ColorBar"
import FormattedAddress from "../components/FormattedAddress"

export default function NanceProposals() {
    const router = useRouter();
    let space = NANCE_DEFAULT_SPACE;
    const newPageQuery: any = { type: 'Payout', version: 2, project: 1 };
    const [keywordInput, setKeywordInput] = useState<string>(undefined);
    const [options, setOptions] = useState<Option[]>([{id: "Loading", label: `Loading...`, status: true}]);
    const [cycleOption, setCycleOption] = useState<Option>(undefined);

    const [query, setQuery] = useQueryParams({
        keyword: StringParam,
        //limit: NumberParam,
        cycle: NumberParam,
        overrideSpace: StringParam
    });
    const {keyword, cycle, overrideSpace} = query;
    if (overrideSpace) {
        space = overrideSpace;
        newPageQuery.overrideSpace = overrideSpace;
    }
    const { data: infoData, isLoading: infoLoading, error: infoError} =  useSpaceInfo({ space: space as string }, router.isReady);
    const { data: proposalData, isLoading: proposalsLoading, error: proposalError }  = useProposals({ space: space as string, cycle, keyword }, router.isReady);
    const currentCycle = cycle || infoData?.data?.currentCycle;
    const allCycle = {id: "All", label: `All`, status: true};

    let remainingTime = "-";
    try {
        remainingTime = formatDistanceToNowStrict(parseISO(infoData?.data?.currentEvent?.end));
    } catch (error) {
        console.warn("🔴 Nance.formatDistanceToNowStrict ->", error);
    }
    
    useEffect(() => {
        // if we can retrieve the current cycle from infoData, then we can populate the options
        const _currentCycle = infoData?.data?.currentCycle;
        const newOptions: Option[] = [];
        if (_currentCycle) {
            newOptions.push(allCycle);
            const nextCycle = _currentCycle + 1;
            newOptions.push({id: `${nextCycle}`, label: `GC-${nextCycle} (Next)`, status: true});
            newOptions.push({id: `${_currentCycle}`, label: `GC-${_currentCycle} (Current)`, status: true});
            for (let i = _currentCycle - 1; i >= 1; i--) {
                newOptions.push({id: `${i}`, label: `GC-${i}`, status: false});
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
    <>
      <SiteNav pageTitle="Current proposals" description="Display info of current proposals on Nance." image="/images/opengraph/nance_current_demo.png" withWallet />
      <div className="m-4 lg:m-6 flex justify-center lg:px-20">
        <div className="flex flex-col max-w-7xl w-full">

            {/* Page header */}
            <div className="max-w-7xl md:flex md:space-x-5 bg-white p-4 shadow rounded-md">
                <div className="flex flex-col space-y-6 items-center md:flex-row md:justify-between md:space-x-6 w-full">
                    <div className="flex-shrink-0 md:w-5/12 flex space-x-3">
                        <img
                            className="h-16 w-16 rounded-full"
                            src={`https://cdn.stamp.fyi/space/jbdao.eth?s=160`}
                            alt="JuiceboxDAO Logo"
                        />

                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">JuiceboxDAO</h1>
                            <p className="text-sm font-medium text-gray-500 text-right">powered by Nance</p>
                        </div>
                    </div>

                    <div className="md:w-5/12 flex space-x-4">
                        <SpaceStats />
                    </div>
                    
                    <div className="break-words p-2 md:w-2/12 text-center rounded-md border-2 border-indigo-600 bg-indigo-100">
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
                    }} options={options} label="Search cycle" />
                </div>

                {/* Search bar and limit */}
                <div className="md:w-3/5">
                    <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">
                        Search proposals
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <div className="relative flex flex-grow items-stretch focus-within:z-10">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <DocumentSearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
                                if(e.key == "Enter") {
                                    setQuery({
                                        keyword: keywordInput
                                    })
                                }
                            }}
                        />
                        </div>
                    </div>
                </div>

                <div className="md:w-1/5 flex items-end">
                    <Link
                        href={{
                            pathname: '/new',
                            query: newPageQuery,
                        }}
                    >
                        <a
                            className="rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 h-fit w-full text-center"
                        >
                            New Proposal
                        </a>
                    </Link>
                </div>

            </div>

            <div className="">
                <ProposalCards space={space} loading={infoLoading || proposalsLoading} proposals={proposalData?.data} query={query} setQuery={setQuery} maxCycle={(infoData?.data?.currentCycle ?? 0) + 1} />
            </div>

            <div className="mt-6 text-center">
                {proposalData?.data?.length > 0 && `Total Proposals: ${proposalData?.data?.length}`}
            </div>
            <div className="mt-2 text-center underline">
                {overrideSpace ? `Override Space: ${overrideSpace}` : ''}
            </div>
        </div>
      </div>
    </>
  )
}

function SpaceStats() {
    // JBX total supply across v1, v2 and v3
    const { value: v1Supply } = useTotalSupplyOfProject({ projectId: 1, version: 1 });
    const { value: v2Supply } = useTotalSupplyOfProject({ projectId: 1, version: 2 });
    const { value: v3Supply } = useTotalSupplyOfProject({ projectId: 1, version: 3 });
    // JuiceboxDAO Snapshot followers
    const { data: spaceInfo } = useSnapshotSpaceInfo('jbdao.eth');

    const totalSupply = v1Supply?.add(v2Supply ?? 0)?.add(v3Supply ?? 0);

    return (
        <>
            <div className="">
                <h1 className="text-sm font-semibold text-gray-900">Overview</h1>
                <div className="flex justify-between space-x-5">
                    <div>
                        <p className="text-xs text-gray-500">Voting Tokens</p>
                        <p className="text-xs text-gray-500">Elligible Addresses</p>
                        <p className="text-xs text-gray-500">Snapshot Followers</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 text-right">{totalSupply ? formatTokenBalance(totalSupply) : '-'}</p>
                        <p className="text-xs text-gray-500 text-right">-</p>
                        <p className="text-xs text-gray-500 text-right">{spaceInfo?.followersCount ?? '-'}</p>
                    </div>
                </div>
            </div>
            <div className="">
                <h1 className="text-sm font-semibold text-gray-900">Participation</h1>
                <div className="flex justify-between space-x-5">
                    <div>
                        <p className="text-xs text-gray-500">Proposals/Cycle</p>
                        <p className="text-xs text-gray-500">Voting Addresses</p>
                        <p className="text-xs text-gray-500">Voting/Total Supply</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 text-right">-</p>
                        <p className="text-xs text-gray-500 text-right">-</p>
                        <p className="text-xs text-gray-500 text-right">-</p>
                    </div>
                </div>
            </div>
        </>
    )
}

function ProposalCards({space, loading, proposals, query, setQuery, maxCycle}: {space: string, loading: boolean, proposals: Proposal[], query: {cycle: number, keyword: string}, setQuery: (o: object) => void, maxCycle: number}) {
    const router = useRouter();
    const [infoText, setInfoText] = useState('');

    useEffect(() => {
        if (loading) {
            setInfoText('Loading...');
        } else {
            if (!proposals) {
                setInfoText('Error. Please try again later.');
            } else if (proposals.length === 0) {
                setInfoText('No proposals found, try below actions:');
            } else {
                setInfoText('');
            }
        }
    }, [proposals, loading]);

    function getLink(proposal: Proposal) {
        const hash = proposal.hash;
        //const pid = proposal.proposalId?.split('-')[1]; // JBP-123
        const pid = undefined;
        const uri = `/p/${pid ||hash}`;
        
        if (space !== NANCE_DEFAULT_SPACE) {
            return `${uri}?overrideSpace=${space}`;
        } else {
            return uri;
        }
    }

    return (
        <>
            <div className="mt-6 bg-white">
                <div className="-mx-6 mt-10 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                        <tr>
                            <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">
                                Status
                            </th>
                            <th
                                scope="col"
                                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                                >
                                Title
                            </th>
                            <th
                                scope="col"
                                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                                >
                                Approval
                            </th>
                            <th
                                scope="col"
                                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                                >
                                Participants
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Cycle
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-6">
                                <span className="sr-only">Select</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                    {proposals?.sort((a, b) => b.governanceCycle - a.governanceCycle).map((proposal, proposalIdx) => (
                        <Link href={getLink(proposal)}>
                        <tr key={proposal.hash} className="hover:bg-slate-100 hover:cursor-pointer">
                            <td
                                className={classNames(
                                    proposalIdx === 0 ? '' : 'border-t border-transparent',
                                'relative py-4 pl-6 pr-3 text-sm'
                                )}
                            >
                                <div className="font-medium text-gray-900">
                                    {(proposal.status === 'Discussion' || proposal.status === 'Draft' || proposal.status === 'Revoked') && (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {proposal.status}
                                        </span>
                                    )}
                                    {proposal.status === 'Approved' && (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Approved
                                        </span>
                                    )}
                                    {proposal.status === 'Cancelled' && (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            Cancelled
                                        </span>
                                    )}
                                    {(proposal.status !== 'Discussion' && proposal.status !== 'Approved' && proposal.status !== 'Cancelled' && proposal.status !== 'Draft' && proposal.status !== 'Revoked') && (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                            {proposal.status}
                                        </span>
                                    )}
                                </div>
                                
                                {proposalIdx !== 0 ? <div className="absolute right-0 left-6 -top-px h-px bg-gray-200" /> : null}
                            </td>
                            <td
                                className={classNames(
                                proposalIdx === 0 ? '' : 'border-t border-gray-200',
                                'hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell'
                                )}
                            >
                                <div className="flex flex-col">
                                    <span>
                                        {`${proposal.proposalId || "TBD"} - by `} 
                                        <FormattedAddress address={proposal.authorAddress} noLink />
                                    </span>
                                    <a className="break-words text-sm text-black">
                                        {proposal.title}
                                    </a>
                                </div>
                                
                            </td>
                            <td
                                className={classNames(
                                    proposalIdx === 0 ? '' : 'border-t border-gray-200',
                                'hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell'
                                )}
                            >
                                <ColorBar greenScore={proposal?.voteResults?.scores[0] || 0} redScore={proposal?.voteResults?.scores[1] || 0} />
                            </td>
                            <td
                                className={classNames(
                                    proposalIdx === 0 ? '' : 'border-t border-gray-200',
                                    'hidden px-3 py-3.5 text-sm text-black lg:table-cell text-center'
                                )}
                            >
                                {proposal?.voteResults?.votes || '-'}
                            </td>
                            <td
                                className={classNames(
                                    proposalIdx === 0 ? '' : 'border-t border-gray-200',
                                'px-3 py-3.5 text-sm text-gray-500'
                                )}
                            >
                                {/* <div className="sm:hidden">{plan.price}/mo</div>
                                <div className="hidden sm:block">{plan.price}/month</div> */}
                                {`GC${proposal.governanceCycle}`}
                            </td>
                        </tr>
                        </Link>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>

            <p className="text-center m-6">
                {infoText}
            </p>

            {!loading && proposals?.length === 0 && (
                <div className="flex flex-col items-center space-y-4 mb-6">
                    <button type="button" 
                        className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
                        onClick={router.back}>
                        Back to previous page
                    </button>

                    {
                        query.keyword && (
                            <button type="button" 
                                className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
                                onClick={() => setQuery({keyword: ''})}>
                                Clear the keyword
                            </button>
                        )
                    }
                    
                    {
                        query.keyword && query.cycle && (
                            <button type="button" 
                                className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
                                onClick={() => setQuery({cycle: undefined})}>
                                Search in all cycles
                            </button>
                        )
                    }

                    {
                        !query.keyword && query.cycle && (
                            <button type="button" 
                                className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
                                onClick={() => setQuery({cycle: getRandomInt(maxCycle) + 1})}>
                                Check different cycle
                            </button>
                        )
                    }
                    
                </div>
            )}
        </>
    )
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}