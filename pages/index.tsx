import Link from "next/link"
import SiteNav from "../components/SiteNav"
import { formatDistanceToNow, formatDistanceToNowStrict, parseISO, toDate } from "date-fns"
import { NumberParam, useQueryParams, StringParam, BooleanParam, withDefault } from "next-query-params"
import { useRouter } from "next/router"
import { useProposals, useSpaceInfo } from "../hooks/NanceHooks"
import { Proposal } from "../models/NanceTypes"
import { useTotalSupplyOfProject } from "../hooks/juicebox/TotalSupplyOfProject"
import { formatTokenBalance } from "../libs/NumberFormatter"
import useSnapshotSpaceInfo from "../hooks/snapshot/SpaceInfo"
import { useEffect, useState } from "react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, DocumentSearchIcon, InformationCircleIcon, XIcon } from '@heroicons/react/solid'
import SearchableComboBox, { Option } from "../components/SearchableComboBox"
import { NANCE_DEFAULT_SPACE } from "../constants/Nance"
import ColorBar from "../components/ColorBar"
import FormattedAddress from "../components/FormattedAddress"
import { SnapshotProposal, useProposalsByID } from "../hooks/snapshot/Proposals"
import { getLastSlash } from "../libs/nance"
import { useAccount } from "wagmi"
import { Tooltip } from "flowbite-react"
import ScrollToBottom from "../components/ScrollToBottom"

export default function NanceProposals() {
  const router = useRouter();
  let space = NANCE_DEFAULT_SPACE;
  const newPageQuery: any = { version: 2, project: 1 };
  const [keywordInput, setKeywordInput] = useState<string>(undefined);
  const [options, setOptions] = useState<Option[]>([{ id: "Loading", label: `Loading...`, status: true }]);
  const [cycleOption, setCycleOption] = useState<Option>(undefined);

  const [query, setQuery] = useQueryParams({
    keyword: StringParam,
    //limit: NumberParam,
    sortBy: withDefault(StringParam, 'title'),
    sortDesc: withDefault(BooleanParam, true),
    cycle: NumberParam,
    overrideSpace: StringParam
  });
  const { keyword, cycle, overrideSpace } = query;
  if (overrideSpace) {
    space = overrideSpace;
    newPageQuery.overrideSpace = overrideSpace;
  }
  const { data: infoData, isLoading: infoLoading, error: infoError } = useSpaceInfo({ space: space as string }, router.isReady);
  const { data: proposalData, isLoading: proposalsLoading, error: proposalError } = useProposals({ space: space as string, cycle, keyword }, router.isReady);
  const currentCycle = cycle || infoData?.data?.currentCycle;
  const allCycle = { id: "All", label: `All`, status: true };

  let remainingTime = "-";
  try {
    remainingTime = formatDistanceToNowStrict(parseISO(infoData?.data?.currentEvent?.end));
  } catch (error) {
    //console.warn("🔴 Nance.formatDistanceToNowStrict ->", error);
  }

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
    <>
      <SiteNav pageTitle="JuiceboxDAO Governance" description="JuiceboxDAO Governance Platform" image="/images/opengraph/homepage.png" withWallet />
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

              <div className="md:w-5/12 flex space-x-4 hidden md:block">
                <SpaceStats />
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
            <ProposalCards space={space} loading={infoLoading || proposalsLoading} proposals={proposalData?.data} query={query} setQuery={setQuery} maxCycle={(infoData?.data?.currentCycle ?? 0) + 1} />
          </div>

          <div className="mt-6 text-center">
            {proposalData?.data?.length > 0 && `Total Proposals: ${proposalData?.data?.length}`}
          </div>
          <div className="mt-2 text-center underline">
            {overrideSpace ? `Override Space: ${overrideSpace}` : ''}
          </div>

          <ScrollToBottom />
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

const StatusValue = {
  'Cancelled': 0,
  'Revoked': 1,
  'Draft': 2,
  'Discussion': 2,
  'Voting': 3,
  'Approved': 4,
  'Implementation': 5,
  'Finished': 6
}
function getValueOfStatus(status: string) {
  return StatusValue[status] ?? -1;
}

function getVotedIcon(choice) {
  if (choice === undefined) {
    return null
  } else if (typeof choice === 'string') {
    if (choice === 'For' || choice === 'Yes') {
      return <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
    } else if (choice === 'Against' || choice === 'No') {
      return <XIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
    }
  }

  return (
    <Tooltip content={JSON.stringify(choice)}>
      <InformationCircleIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
    </Tooltip>
  )
}

type SortOptions = "" | "status" | "title" | "approval" | "participants" | "voted"
const SortOptionsArr = ["status", "title", "approval", "participants", "voted"]

function ProposalCards({ space, loading, proposals, query, setQuery, maxCycle }:
  {
    space: string, loading: boolean, proposals: Proposal[],
    query: { cycle: number, keyword: string, overrideSpace: string, sortBy: string, sortDesc: boolean },
    setQuery: (o: object) => void, maxCycle: number
  }) {
  const router = useRouter();
  const [infoText, setInfoText] = useState('');
  const { address, isConnected } = useAccount();

  // for those proposals with no results cached by nance, we need to fetch them from snapshot
  const snapshotProposalIds: string[] = proposals?.filter(p => p.voteURL).map(p => getLastSlash(p.voteURL)) || [];
  const { data, loading: snapshotLoading, error } = useProposalsByID(snapshotProposalIds, address, snapshotProposalIds.length === 0);
  // convert proposalsData to dict with proposal id as key
  const snapshotProposalDict: { [id: string]: SnapshotProposal } = {};
  data?.proposalsData?.forEach(p => snapshotProposalDict[p.id] = p);
  // override the snapshot proposal vote results into proposals.voteResults
  const mergedProposals: Proposal[] = proposals?.map(p => {
    const snapshotProposal = snapshotProposalDict[getLastSlash(p.voteURL)];
    if (snapshotProposal) {
      return {
        ...p, voteResults: {
          choices: snapshotProposal.choices,
          scores: snapshotProposal.scores,
          votes: snapshotProposal.votes
        }
      };
    } else {
      return p;
    }
  });
  const votedData = data?.votedData;
  // sort proposals
  let sortedProposals = mergedProposals?.sort((a, b) => b.governanceCycle - a.governanceCycle) || []
  if (!query.sortBy || !SortOptionsArr.includes(query.sortBy)) {
    // fall back to default sorting
    sortedProposals
      .sort((a, b) => getValueOfStatus(b.status) - getValueOfStatus(a.status))
      .sort((a, b) => (b.voteResults?.votes ?? 0) - (a.voteResults?.votes ?? 0))
  } else {
    if (query.sortBy === "status") {
      sortedProposals.sort((a, b) => getValueOfStatus(b.status) - getValueOfStatus(a.status))
    } else if (query.sortBy === "approval") {
      const sumScores = (p: Proposal) => {
        return (p?.voteResults?.scores ?? []).reduce((partialSum, a) => partialSum + a, 0)
      }
      sortedProposals.sort((a, b) => sumScores(b) - sumScores(a))
    } else if (query.sortBy === "participants") {
      sortedProposals.sort((a, b) => (b.voteResults?.votes ?? 0) - (a.voteResults?.votes ?? 0))
    } else if (query.sortBy === "voted") {
      const votedWeightOf = (p: Proposal) => votedData?.[getLastSlash(p.voteURL)] !== undefined ? 1 : -1
      sortedProposals.sort((a, b) => votedWeightOf(b) - (votedWeightOf(a)))
    } else {
      sortedProposals.sort()
    }

    if (!query.sortDesc) {
      sortedProposals.reverse()
    }
  }

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
    const uri = `/p/${proposal.proposalId || hash}`;

    if (space !== NANCE_DEFAULT_SPACE) {
      return `${uri}?overrideSpace=${space}`;
    } else {
      return uri;
    }
  }

  function SortableTableHeader({ val, label }: { val: SortOptions, label: string }) {
    const sortedByCurrentVal = query.sortBy === val

    return (
      <button onClick={() => {
        if (!sortedByCurrentVal) {
          setQuery({ sortBy: val, sortDesc: true })
        } else {
          setQuery({ sortDesc: !query.sortDesc })
        }
      }} className="group inline-flex">

        {label}
        {sortedByCurrentVal && (
          <span className="ml-2 flex-none rounded bg-gray-100 text-gray-900 group-hover:bg-gray-200">
            {query.sortDesc && <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />}
            {!query.sortDesc && <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />}
          </span>
        )}

      </button>
    )
  }

  return (
    <>
      <div className="mt-6 bg-white">
        <div className="mt-10 ring-1 ring-gray-300 sm:mx-0 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="hidden py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 md:table-cell">
                  <SortableTableHeader val="status" label="Status" />
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  <SortableTableHeader val="title" label="Title" />
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-center text-sm font-semibold text-gray-900 md:table-cell"
                >
                  <SortableTableHeader val="approval" label="Approval" />
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3.5 text-center text-sm font-semibold text-gray-900 md:table-cell"
                >
                  <SortableTableHeader val="participants" label="Participants" />
                </th>
                <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 md:table-cell">
                  <SortableTableHeader val="voted" label="Voted" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedProposals.map((proposal, proposalIdx) => (

                <Link href={getLink(proposal)} key={proposal.hash}>
                  <tr className="hover:bg-slate-100 hover:cursor-pointer">
                    <td
                      className={classNames(
                        proposalIdx === 0 ? '' : 'border-t border-transparent',
                        'relative py-4 pl-6 pr-3 text-sm hidden md:table-cell'
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
                        'px-3 py-3.5 text-sm text-gray-500'
                      )}
                    >
                      <div className="flex flex-col space-y-1">
                        <div className="text-gray-900 block md:hidden">
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
                        <span className="text-xs">
                          {`GC-${proposal.governanceCycle}, JBP-${proposal.proposalId || "tbd"} - by `}
                          <FormattedAddress address={proposal.authorAddress} noLink />
                        </span>

                        <a className="break-words text-base text-black">
                          {proposal.title}
                        </a>
                      </div>

                    </td>
                    <td
                      className={classNames(
                        proposalIdx === 0 ? '' : 'border-t border-gray-200',
                        'hidden px-3 py-3.5 text-sm text-gray-500 md:table-cell'
                      )}
                    >
                      <VotesBar proposal={proposal} snapshotProposal={snapshotProposalDict[getLastSlash(proposal.voteURL)]} />
                    </td>
                    <td
                      className={classNames(
                        proposalIdx === 0 ? '' : 'border-t border-gray-200',
                        'hidden px-3 py-3.5 text-sm text-black md:table-cell text-center'
                      )}
                    >
                      {proposal?.voteResults?.votes || '-'}
                    </td>
                    <td
                      className={classNames(
                        proposalIdx === 0 ? '' : 'border-t border-gray-200',
                        'px-3 py-3.5 text-sm text-gray-500 hidden md:table-cell text-center'
                      )}
                    >
                      {getVotedIcon(votedData?.[getLastSlash(proposal.voteURL)]?.choice)}
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
                onClick={() => setQuery({ keyword: '' })}>
                Clear the keyword
              </button>
            )
          }

          {
            query.keyword && query.cycle && (
              <button type="button"
                className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
                onClick={() => setQuery({ cycle: undefined })}>
                Search in all cycles
              </button>
            )
          }

          {
            !query.keyword && query.cycle && (
              <button type="button"
                className="items-center rounded border border-transparent bg-indigo-700 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm"
                onClick={() => setQuery({ cycle: getRandomInt(maxCycle) + 1 })}>
                Check different cycle
              </button>
            )
          }

        </div>
      )}
    </>
  )
}

function getVotingTimeLabel(p: SnapshotProposal) {
  if (!p) return ""

  const currentTime = Math.floor(Date.now() / 1000)
  if (currentTime < p.start) {
    return `Voting starts ${formatDistanceToNow(toDate(p.start * 1000), { addSuffix: true })}`
  } else if (currentTime >= p.start && currentTime <= p.end) {
    return `Voting ends ${formatDistanceToNow(toDate(p.end * 1000), { addSuffix: true })}`
  } else {
    return `Voting ended ${formatDistanceToNow(toDate(p.end * 1000), { addSuffix: true })}`
  }
}

function VotesBar({ snapshotProposal, proposal }: { snapshotProposal: SnapshotProposal, proposal: Proposal }) {
  const hasSnapshotVoting = snapshotProposal !== undefined

  if (hasSnapshotVoting) {
    return (
      <div className="flex flex-col space-y-1">
        <span className="text-xs">
          {getVotingTimeLabel(snapshotProposal)}
        </span>

        {['approval', 'ranked-choice', 'quadratic', 'weighted'].includes(snapshotProposal?.type) ? (
          // sum all scores to get the total score
          <ColorBar greenScore={snapshotProposal.scores_total || 0} redScore={0} />
        ) : (
          <ColorBar greenScore={proposal?.voteResults?.scores[0] || 0} redScore={proposal?.voteResults?.scores[1] || 0} />
        )
        }
      </div>
    )
  } else {
    return (
      <div className="flex flex-col space-y-1">
        {proposal.status === "Cancelled" && (
          <span className="text-xs">
            Temp check failed
          </span>
        )}
        {proposal.status !== "Cancelled" && (
          <span className="text-xs">
            Temp check
          </span>
        )}


        <ColorBar greenScore={proposal?.temperatureCheckVotes?.[0] || 0} redScore={proposal?.temperatureCheckVotes?.[1] || 0} threshold={10} />
      </div>
    )
  }
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
