import { useRouter } from "next/router";
import { fetchProposalInfo, SnapshotProposal, useProposalVotes } from "../../../../hooks/snapshot/Proposals";
import { useAccount } from 'wagmi'
import SiteNav from "../../../../components/SiteNav";
import { fetchSpaceInfo, SpaceInfo } from "../../../../hooks/snapshot/SpaceInfo";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { Tooltip } from 'flowbite-react';
import FormattedAddress from "../../../../components/FormattedAddress";
import { fromUnixTime, format, formatDistanceToNowStrict } from "date-fns";
import { useEffect, useState } from "react";
import VotingModal from "../../../../components/VotingModal";
import { withDefault, NumberParam, createEnumParam, useQueryParams } from "next-query-params";
import Pagination from "../../../../components/Pagination";
import { formatChoices } from "../../../../libs/snapshotUtil";
import ProposalStats from "../../../../components/ProposalStats";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact" , compactDisplay: "short" });
const formatNumber = (num) => formatter.format(num);

const labelWithTooltip = (label: string, tooltip: string, colors: string) => (
    <Tooltip
      content={tooltip}
      trigger="hover"
    >
      <span className={classNames(
                        colors,
                        "flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full"
                    )}>
        {label}
      </span>
    </Tooltip>
)

const getColorOfPencentage = (percentage: number) => {
    if(percentage>33) {
        return 'text-red-600';
    } else if(percentage>20) {
        return 'text-orange-600';
    } else if(percentage>11) {
        return 'text-amber-600';
    } else {
        return '';
    }
}

export async function getServerSideProps(context) {
    // Fetch data from external API
    const spaceInfo = await fetchSpaceInfo(context.params.space);
    const proposalInfo = await fetchProposalInfo(context.params.proposal);
  
    // Pass data to the page via props
    return { props: { spaceInfo, proposalInfo } }
}

export default function SnapshotProposalPage({ spaceInfo, proposalInfo }: { spaceInfo: SpaceInfo, proposalInfo: SnapshotProposal }) {
    // router
    const router = useRouter();
    const { space, proposal } = router.query;
    // state
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [voteDisabled, setVoteDisabled] = useState(true);
    const [voteTip, setVoteTip] = useState("Proposal is not active");
    const [query, setQuery] = useQueryParams({ 
        page: withDefault(NumberParam, 1), 
        sortBy: withDefault(createEnumParam(["created", "vp"]), "created"),
        withField: withDefault(createEnumParam(["reason", "app"]), "")
      });
    // const [page, setPage] = useQueryParam('page', withDefault(NumberParam, 1));
    // const [sortBy, setSortBy] = useQueryParam('sortBy', withDefault(createEnumParam(["created", "vp"]), "created"));
    // external hook
    const { address, isConnected } = useAccount();
    // load data
    const { loading, data, error } = useProposalVotes(proposalInfo, address, Math.max((query.page-1)*10, 0), query.sortBy as "created" | "vp", query.withField as "reason" | "app" | "");

    useEffect(() => {
        if(proposalInfo?.state === 'active') {
            if(isConnected) {
                setVoteTip("Proposal is active and you can vote on it");
                setVoteDisabled(false);
            } else {
                setVoteTip("You haven't connected wallet");
            }
        }
    }, [isConnected, proposalInfo]);

    return (
        <>
            <SiteNav 
                pageTitle={`${proposalInfo.title} - ${spaceInfo?.name || (space as string) || ''}`} 
                description={proposalInfo.body?.slice(0, 140) || 'No content'} 
                image={`https://cdn.stamp.fyi/space/${space as string}?w=1200&h=630`}
                withWallet />

            <div className="min-h-full">
                <main className="py-10">
                {/* Page header */}
                <div className="mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
                    <div className="flex items-center space-x-5">
                    <div className="flex-shrink-0">
                        <div className="relative">
                        <img
                            className="h-16 w-16 rounded-full"
                            src={`https://cdn.stamp.fyi/space/${space}?s=160`}
                            alt=""
                        />
                        <span className="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{proposalInfo.title}</h1>
                        <p className="text-sm font-medium text-gray-500">
                        By&nbsp;
                        <FormattedAddress address={proposalInfo.author} style="text-gray-900" />
                        &nbsp;on <time dateTime={proposalInfo.created ? fromUnixTime(proposalInfo.created).toString() : ''}>{proposalInfo.created && format(fromUnixTime(proposalInfo.created), 'MMMM d, yyyy')}</time>
                        </p>
                    </div>
                    </div>
                    <div className="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
                        <Link href={`/snapshot/${space}`}>
                            <a className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                Back
                            </a>
                        </Link>
                        <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setModalIsOpen(true)}
                            disabled={voteDisabled}>

                            <Tooltip trigger="hover" content={voteTip}>
                                <span>Vote</span>
                            </Tooltip>
                        </button>
                        {proposalInfo?.choices && (
                            <VotingModal modalIsOpen={modalIsOpen} closeModal={() => setModalIsOpen(false)} address={address} spaceId={space as string} proposal={proposalInfo} />
                        )}
                    </div>
                </div>

                <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2 lg:col-start-1">
                        {/* Content */}
                        <section aria-labelledby="applicant-information-title">
                            <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6 flex space-x-3">
                                <h2 id="applicant-information-title" className="text-lg font-medium leading-6 text-gray-900">
                                    Proposal
                                </h2>

                                {/* Proposal status */}
                                <div className='min-w-fit'>
                                    {proposalInfo.state === 'active' && (
                                        <span className="text-green-800 bg-green-100 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full">
                                            Active for {formatDistanceToNowStrict(fromUnixTime(proposalInfo.end))}
                                        </span>
                                    )}
                                    {proposalInfo.state === 'pending' && labelWithTooltip('Pending', 'This proposal is currently pending and not open for votes.', 'text-yellow-800 bg-yellow-100')}
                                    {proposalInfo.state === 'closed' && (
                                        <span className="text-gray-800 bg-gray-100 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full">
                                            Closed {formatDistanceToNowStrict(fromUnixTime(proposalInfo.end), { addSuffix: true })}
                                        </span>
                                    )}
                                </div>

                                {/* Under quorum status */}
                                {proposalInfo.quorum != 0 && proposalInfo.scores_total < proposalInfo.quorum && (
                                    <div className='min-w-fit'>
                                        <span className="text-purple-800 bg-purple-100 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full">
                                        Under quorum: {(proposalInfo.scores_total*100/proposalInfo.quorum).toFixed()}%
                                        </span>
                                    </div>
                                )}

                                {/* <p className="mt-1 max-w-2xl text-sm text-gray-500">Proposal details.</p> */}
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                <article className="prose prose-lg prose-indigo mx-auto mt-6 text-gray-500 break-words">
                                    <ReactMarkdown>{proposalInfo.body}</ReactMarkdown>
                                </article>
                            </div>
                            <div>
                                <Link href={`https://snapshot.org/#/${space}/proposal/${proposal}`}>
                                    <a target="_blank" rel="noopener noreferrer" className="block bg-gray-50 px-4 py-4 text-center text-sm font-medium text-gray-500 hover:text-gray-700 sm:rounded-b-lg">
                                        Read on Snapshot
                                    </a>
                                </Link>
                            </div>
                            </div>
                        </section>

                        {/* Votes */}
                        <section aria-labelledby="votes-title" className={proposalInfo?.state == 'pending' ? 'hidden' : undefined}>
                            <div className="bg-white shadow sm:overflow-hidden sm:rounded-lg">
                            <div className="divide-y divide-gray-200">
                                <div className="px-4 py-5 sm:px-6 flex flex-row justify-between">
                                    <h2 id="notes-title" className="text-lg font-medium text-gray-900">
                                        Votes
                                        <span className='bg-indigo-100 text-indigo-600 hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block'>
                                            {data?.totalVotes || 0}
                                        </span>
                                    </h2>

                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-xs sm:text-sm text-gray-500">
                                            SortBy
                                        </span>
                                        <select
                                            id="sortBy"
                                            name="sortBy"
                                            className="block w-full rounded-none border-gray-300 text-xs focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                            value={query.sortBy}
                                            onChange={(e) => {
                                                setQuery({
                                                    page: 1,
                                                    sortBy: e.target.value,
                                                })
                                                // setPage(1, 'push');
                                                // setSortBy(e.target.value as "created" | "vp", 'push');
                                            }}
                                        >
                                            <option value="created">Time</option>
                                            <option value="vp">Weight</option>
                                        </select>
                                        <span className="inline-flex items-center rounded-none border border-r-0 border-gray-300 bg-gray-50 px-3 text-xs sm:text-sm text-gray-500">
                                            Require
                                        </span>
                                        <select
                                            id="withField"
                                            name="withField"
                                            className="block w-full rounded-none rounded-r-md border-gray-300 text-xs focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                            value={query.withField}
                                            onChange={(e) => {
                                                setQuery({
                                                    withField: e.target.value,
                                                })
                                            }}
                                        >
                                            <option value="">None</option>
                                            <option value="reason">Reason</option>
                                            <option value="app">App</option>
                                        </select>
                                    </div>

                                </div>
                                <div className="px-4 py-6 sm:px-6">
                                    <ul role="list" className="space-y-8">
                                        {loading && "loading..."}
                                        {data?.votesData?.map((vote) => (
                                            <li key={vote.id}>
                                                <div className="flex space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <img className="h-10 w-10 rounded-full"
                                                            src={`https://cdn.stamp.fyi/avatar/${vote.voter}?s=160`}
                                                            alt={`avatar of ${vote.voter}`}
                                                        />
                                                    </div>
                                                    <div className="space-y-1 overflow-hidden">
                                                        <div className="text-sm">
                                                            <FormattedAddress address={vote.voter} style="font-medium text-gray-900" />
                                                        </div>
                                                        <div className="text-sm">
                                                            <div className={classNames(
                                                                getColorOfPencentage(vote.vp*100/proposalInfo?.scores_total),
                                                                'underline'
                                                            )}>
                                                                {` ${formatNumber(vote.vp)} (${(vote.vp*100/proposalInfo?.scores_total).toFixed()}%)`}
                                                            </div>
                                                            <div className="w-full overflow-hidden">
                                                                <p className="truncate">{formatChoices(proposalInfo.type, vote.choice)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-800 font-semibold line-clamp-3 lg:line-clamp-5">
                                                            <Tooltip
                                                                content={vote.reason}
                                                                trigger="hover"
                                                                >
                                                                {vote.reason && <p>{vote.reason}</p>}
                                                            </Tooltip>
                                                        </div>
                                                        <div className="space-x-2 text-sm">
                                                            <span className="text-gray-500">
                                                                {formatDistanceToNowStrict(fromUnixTime(vote.created), { addSuffix: true })}
                                                            </span>{' '}
                                                            {vote.app && vote.app!="snapshot" && (
                                                                <>
                                                                    <span className="font-medium text-gray-500">&middot;</span>{' '}
                                                                    <span className="font-medium text-gray-500">
                                                                        {vote.app}
                                                                    </span>
                                                                </>
                                                            )}
                                                            
                                                            {/* <a href={`https://snapshot.mypinata.cloud/ipfs/${vote.id}`} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900">
                                                                IPFS
                                                            </a> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <Pagination page={query.page} setPage={(page) => setQuery({page})} total={data?.totalVotes || 0} limit={10} />
                                </div>
                            </div>
                            </div>
                        </section>
                    </div>

                    <section aria-labelledby="stats-title" className="lg:col-span-1 lg:col-start-3">
                        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
                            <h2 id="timeline-title" className="text-lg font-medium text-gray-900">
                                Results
                            </h2>

                            <div className="mt-6 flow-root">
                                <ProposalStats proposal={proposalInfo} />
                            </div>

                        </div>
                    </section>
                </div>
                </main>
            </div>
        </>
    )
}