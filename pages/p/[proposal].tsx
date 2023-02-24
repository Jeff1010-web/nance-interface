import { fetchProposalInfo, SnapshotProposal, useProposalVotes, VOTES_PER_PAGE } from "../../hooks/snapshot/Proposals";
import { useAccount } from 'wagmi'
import SiteNav from "../../components/SiteNav";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { Tooltip } from 'flowbite-react';
import FormattedAddress from "../../components/FormattedAddress";
import { fromUnixTime, format, formatDistanceToNowStrict } from "date-fns";
import { createContext, useContext, useEffect, useState } from "react";
import VotingModal from "../../components/VotingModal";
import { withDefault, NumberParam, createEnumParam, useQueryParams } from "next-query-params";
import { processChoices } from "../../libs/snapshotUtil";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import ColorBar from "../../components/ColorBar";

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

const getColorOfChoice = (choice: string) => {
    if(choice=='For') {
        return 'text-green-500';
    } else if(choice=='Against') {
        return 'text-red-500';
    } else if(choice=='Abstain') {
        return 'text-gray-500';
    } else {
        return '';
    }
}

export async function getServerSideProps(context) {
    // Fetch data from external API
    const proposalInfo = await fetchProposalInfo(context.params.proposal);
  
    // Pass data to the page via props
    return { props: { proposalInfo } }
}

const ProposalContext = createContext<SnapshotProposal>(undefined);

export default function SnapshotProposalPage({ proposalInfo }: { proposalInfo: SnapshotProposal }) {

    return (
        <>
            <SiteNav 
                pageTitle={`${proposalInfo.title}`} 
                description={proposalInfo.body?.slice(0, 140) || 'No content'} 
                image={`https://cdn.stamp.fyi/space/jbdao.eth?w=1200&h=630`}
                withWallet />

            <div className="min-h-full">
                <main className="py-10">
                    <ProposalContext.Provider value={proposalInfo}>
                        <ProposalHeader />

                        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
                            <div className="space-y-6 lg:col-span-2 lg:col-start-1">
                                {/* Content */}
                                <section aria-labelledby="applicant-information-title">
                                    <ProposalContent status={proposalInfo.state} body={proposalInfo.body} end={proposalInfo.end} />
                                </section>
                            </div>

                            <section aria-labelledby="stats-title" className="lg:col-span-1 lg:col-start-3">
                                <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6 sticky top-6 bottom-6 opacity-100 h-[52rem]">
                                    <h2 id="timeline-title" className="text-lg font-medium text-gray-900">
                                        Votes
                                    </h2>

                                    <div className="mt-6 flow-root overflow-y-scroll h-[8rem]">
                                        <ProposalStats proposal={proposalInfo} />
                                    </div>

                                    <div className="overflow-y-scroll h-[36rem] border-t">
                                        <ProposalVotes />
                                    </div>

                                </div>
                            </section>
                        </div>
                    </ProposalContext.Provider>
                </main>
            </div>
        </>
    )
}

function ProposalHeader() {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [voteDisabled, setVoteDisabled] = useState(true);
    const [voteTip, setVoteTip] = useState("Proposal is not active");
    const { address, isConnected } = useAccount();
    const proposalInfo = useContext(ProposalContext);

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
        <div className="mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
            <div className="flex items-center space-x-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{proposalInfo.title}</h1>
                    <p className="text-sm font-medium text-gray-500">
                    By&nbsp;
                    <FormattedAddress address={proposalInfo.author} style="text-gray-900" overrideURLPrefix="/snapshot/profile/" openInNewWindow={false} />
                    &nbsp;on <time dateTime={proposalInfo.created ? fromUnixTime(proposalInfo.created).toString() : ''}>{proposalInfo.created && format(fromUnixTime(proposalInfo.created), 'MMMM d, yyyy')}</time>
                    </p>
                </div>
            </div>
            <div className="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
                <Link href={`/`}>
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
                    <VotingModal modalIsOpen={modalIsOpen} closeModal={() => setModalIsOpen(false)} address={address} spaceId="jbdao.eth" proposal={proposalInfo} spaceHideAbstain />
                )}
            </div>
        </div>
    )
}

function ProposalContent({status, body, end = 0}: {status: string, body: string, end?: number}) {

    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex space-x-3 flex-wrap">
                <h2 id="applicant-information-title" className="text-lg font-medium leading-6 text-gray-900">
                    Proposal
                </h2>

                {/* Proposal status */}
                <div className='min-w-fit'>
                    {status === 'active' && (
                        <span className="text-green-800 bg-green-100 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full">
                            Active for {formatDistanceToNowStrict(fromUnixTime(end))}
                        </span>
                    )}
                    {status === 'pending' && labelWithTooltip('Pending', 'This proposal is currently pending and not open for votes.', 'text-yellow-800 bg-yellow-100')}
                    {status === 'closed' && (
                        <span className="text-gray-800 bg-gray-100 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full">
                            Closed {formatDistanceToNowStrict(fromUnixTime(end), { addSuffix: true })}
                        </span>
                    )}
                </div>

                {/* <p className="mt-1 max-w-2xl text-sm text-gray-500">Proposal details.</p> */}
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <article className="prose prose-lg prose-indigo mx-auto mt-6 text-gray-500 break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{body}</ReactMarkdown>
                </article>
            </div>
        </div>
    )
}

// BasicVoting: For Against Abstain
const ABSTAIN_INDEX = 2;
const SUPPORTED_VOTING_TYPES_FOR_GROUP = ["basic", "single-choice", "approval"]

function ProposalStats({proposal, isOverview = false}: 
    {proposal: SnapshotProposal, isOverview?: boolean}) {

    const { loading, data, error } = useProposalVotes(proposal, 0, "created", "", isOverview, proposal.votes);

    let scores = proposal?.scores
      ?.map((score, index) => {return { score, index }})
      .filter((o) => o.score>0)
      // sort by score desc
      .sort((a, b) => b.score - a.score)

    const displayVotesByGroup = SUPPORTED_VOTING_TYPES_FOR_GROUP.includes(proposal.type);
    let votesGroupByChoice: { [choice: string]: number } = {};
    if(!isOverview && displayVotesByGroup) {
        // iterate votesData and group by choice
        votesGroupByChoice = data?.votesData.reduce((acc, vote) => {
            const choice = vote.choice;
            if(!acc[choice]) {
                acc[choice] = 0;
            }
            acc[choice]++;
            return acc;
        }, {});
    }

    return (
        <dl className="m-2 grid grid-cols-2 gap-5">
            {/* Vote choice data */}
            {!isOverview && proposal.scores_total > 0 && 
                scores.map(({ score, index }) => (
                    <div key={index} className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                        <Tooltip
                            content={proposal?.choices[index]}
                            trigger="hover"
                        >
                            <dt className="text-sm font-medium text-gray-500 truncate">{proposal?.choices[index]}</dt>
                        </Tooltip>
                        <Tooltip
                            content={`${(score*100/proposal.scores_total).toFixed(2)}%`}
                            trigger="hover"
                        >
                            {/* <dd className="mt-1 text-3xl tracking-tight font-semibold text-gray-900">{(proposal.voteByChoice[choice]*100/proposal.scores_total).toFixed(2)}%</dd> */}
                            <dd className="mt-1 text-3xl tracking-tight font-semibold text-gray-900">
                                {formatNumber(score)}
                            </dd>
                            {displayVotesByGroup && (
                                <span className="text-sm font-medium text-gray-500">
                                    {votesGroupByChoice?.[proposal?.choices[index]] ?? 0} votes
                                </span>
                            )}
                            {!displayVotesByGroup && (
                                <span className="text-sm font-medium text-gray-500">
                                    {(score*100/proposal.scores_total).toFixed()}%
                                </span>
                            )}
                            
                        </Tooltip>
                    </div>
            ))}
        </dl>
    )
}

function ProposalVotes() {
    const proposalInfo = useContext(ProposalContext);
    const [query, setQuery] = useQueryParams({ 
        page: withDefault(NumberParam, 1), 
        sortBy: withDefault(createEnumParam(["created", "vp"]), "created"),
        withField: withDefault(createEnumParam(["reason", "app"]), "")
    });

    const { loading, data, error } = useProposalVotes(proposalInfo, Math.max((query.page-1)*VOTES_PER_PAGE, 0), query.sortBy as "created" | "vp", query.withField as "reason" | "app" | "");

    const proposalType = proposalInfo.type;

    if (['approval', 'ranked-choice', 'quadratic', 'weighted'].includes(proposalType)) {
        return (
            <>
                <div className="border-t border-gray-200 py-6">
                    <div className="flex justify-between">
                        <p className="text-green-500 text-sm">VOTES {formatNumber(proposalInfo.scores_total || 0)}</p>
                    </div>
                    <div className='p-3 text-sm text-gray-500'>
                        <ColorBar greenScore={proposalInfo.scores_total || 0} redScore={0} noTooltip />
                    </div>
                    <div className="flex justify-between">
                        <p className="text-sm">QUORUM {formatNumber(proposalInfo.quorum || 0)}</p>
                        <p className="text-sm">VOTER {formatNumber(proposalInfo.votes || 0)}</p>
                    </div>
                </div>

                <ul role="list" className="space-y-2 pt-2">
                    {loading && "loading..."}
                    {data?.votesData?.map((vote) => (
                        <li key={vote.id}>
                            <div className="flex flex-col">
                                <div className="text-sm">
                                    <div>
                                        <FormattedAddress address={vote.voter} style="text-gray-900" overrideURLPrefix="https://juicetool.xyz/snapshot/profile/" openInNewWindow={true} />
                                    </div>

                                    <div className="text-xs text-slate-700 font-semibold">
                                        {`${formatNumber(vote.vp)} (${(vote.vp*100/proposalInfo?.scores_total).toFixed()}%)`} total
                                    </div>
                                    
                                    <div className="text-sm text-gray-600 py-2">
                                        {(processChoices(proposalInfo.type, vote.choice) as string[]).map((choice) => (
                                            <p>{choice}</p>
                                        ))}
                                    </div>
                                </div>

                                {
                                    vote.reason && (
                                        <div className="text-sm text-gray-600">
                                            {vote.reason}
                                        </div>
                                    )
                                }
                            </div>
                        </li>
                    ))}
                </ul>
            </>
        )
    }

    return (
        <>
            <div className="border-t border-gray-200 py-6">
                <div className="flex justify-between">
                    <p className="text-green-500 text-sm">FOR {formatNumber(proposalInfo.scores[0] || 0)}</p>
                    <p className="text-red-500 text-sm">AGAINST {formatNumber(proposalInfo.scores[1] || 0)}</p>
                </div>
                <div className='p-3 text-sm text-gray-500'>
                    <ColorBar greenScore={proposalInfo.scores[0] || 0} redScore={proposalInfo.scores[1] || 0} noTooltip />
                </div>
                <div className="flex justify-between">
                    <p className="text-sm">QUORUM {formatNumber(proposalInfo.quorum || 0)}</p>
                    <p className="text-sm">VOTER {formatNumber(proposalInfo.votes || 0)}</p>
                </div>
            </div>
            
        
            <ul role="list" className="space-y-2 pt-2">
                {loading && "loading..."}
                {data?.votesData?.map((vote) => (
                    <li key={vote.id}>
                        <div className="flex flex-col">
                            <div className="text-sm flex justify-between">
                                <div>
                                    <FormattedAddress address={vote.voter} style="text-gray-900" overrideURLPrefix="https://juicetool.xyz/snapshot/profile/" openInNewWindow={true} />
                                    &nbsp;
                                    <span className={classNames(
                                        getColorOfChoice(processChoices(proposalInfo.type, vote.choice) as string),
                                        ''
                                    )}>
                                        voted {processChoices(proposalInfo.type, vote.choice) as string}
                                    </span>
                                </div>

                                <div>
                                    {`${formatNumber(vote.vp)} (${(vote.vp*100/proposalInfo?.scores_total).toFixed()}%)`}
                                </div>
                                
                            </div>

                            {
                                vote.reason && (
                                    <div className="text-sm text-gray-600">
                                        {vote.reason}
                                    </div>
                                )
                            }
                        </div>
                    </li>
                ))}
            </ul>
        </>
    )
}