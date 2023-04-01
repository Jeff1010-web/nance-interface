import { fetchProposalInfo, SnapshotProposal, useProposalVotes, VOTES_PER_PAGE } from "../../hooks/snapshot/Proposals";
import { useAccount } from 'wagmi'
import SiteNav from "../../components/SiteNav";
import ReactMarkdown from "react-markdown";
import { Tooltip } from 'flowbite-react';
import FormattedAddress from "../../components/FormattedAddress";
import { fromUnixTime, format, toDate } from "date-fns";
import { createContext, useContext, useEffect, useState } from "react";
import VotingModal from "../../components/VotingModal";
import { withDefault, NumberParam, createEnumParam, useQueryParams, useQueryParam, StringParam } from "next-query-params";
import { processChoices } from "../../libs/snapshotUtil";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import ColorBar from "../../components/ColorBar";
import { fetchProposal } from "../../hooks/NanceHooks";
import { getLastSlash } from "../../libs/nance";
import { Proposal, Payout } from "../../models/NanceTypes";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Custom404 from "../404";
import VoterProfile from "../../components/VoterProfile";
import ScrollToBottom from "../../components/ScrollToBottom";
import { ExternalLinkIcon } from "@heroicons/react/solid";
import ResolvedProject from "../../components/ResolvedProject";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact", compactDisplay: "short" });
const formatNumber = (num) => formatter.format(num);

const getColorOfChoice = (choice: string) => {
  if (choice == 'For') {
    return 'text-green-500';
  } else if (choice == 'Against') {
    return 'text-red-500';
  } else if (choice == 'Abstain') {
    return 'text-gray-500';
  } else {
    return '';
  }
}

function openInDiscord(url) {
  try {
    // use URL object to replace https:// with discord://
    const discordUrl = new URL(url);
    discordUrl.protocol = 'discord:';
    return discordUrl.toString();
  } catch (error) {
    return url;
  }
}

export async function getServerSideProps(context) {
  let snapshotProposal: SnapshotProposal;
  let proposal: Proposal;

  // check proposal parameter type
  const proposalParam: string = context.params.proposal;
  const spaceParam: string = context.query.overrideSpace || 'juicebox';

  const proposalResponse = await fetchProposal(spaceParam, proposalParam);
  proposal = proposalResponse.data;
  const proposalHash = getLastSlash(proposal?.voteURL);
  if (proposalHash) {
    snapshotProposal = await fetchProposalInfo(proposalHash);
  }

  // Pass data to the page via props
  return {
    props: {
      proposal: proposal || null,
      snapshotProposal: snapshotProposal || null
    }
  }
}

interface ProposalCommonProps {
  status: string;
  title: string;
  author: string;
  body: string;
  created: number;
  end: number;
  snapshot: string,
  ipfs: string,
  payout: Payout
}

const ProposalContext = createContext<{ commonProps: ProposalCommonProps, proposalInfo: SnapshotProposal }>(undefined);

export default function NanceProposalPage({ proposal, snapshotProposal }: { proposal: Proposal | undefined, snapshotProposal: SnapshotProposal | undefined }) {
  const [selectedVoter, setSelectedVoter] = useState<string>('');
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    withField: withDefault(createEnumParam(["reason", "app"]), ""),
    overrideSpace: StringParam
  });
  const editPageQuery = {
    proposalId: proposal?.hash,
    version: 2,
    project: 1
  };
  if (query.overrideSpace) {
    editPageQuery['overrideSpace'] = query.overrideSpace;
  }

  // this page need proposal to work
  if (!proposal) {
    return <Custom404 errMsg="Proposal not found on Nance platform, you can reach out in Discord or explore on the home page." />
  }

  const commonProps: ProposalCommonProps = {
    status: snapshotProposal?.state || proposal.status,
    title: snapshotProposal?.title || proposal.title,
    author: snapshotProposal?.author || proposal.authorAddress,
    body: snapshotProposal?.body || proposal.body,
    created: snapshotProposal?.start || Math.floor(new Date(proposal.date).getTime() / 1000),
    end: snapshotProposal?.end || 0,
    snapshot: snapshotProposal?.snapshot || "",
    ipfs: snapshotProposal?.ipfs || "",
    payout: proposal.payout
  }
  console.debug("📚NanceProposalPage.begin", commonProps, proposal, snapshotProposal);

  return (
    <>
      <SiteNav
        pageTitle={`${commonProps.title}`}
        description={commonProps.body?.slice(0, 140) || 'No content'}
        image={`https://cdn.stamp.fyi/space/jbdao.eth?w=1200&h=630`}
        withWallet />

      <div className="min-h-full">
        <main className="py-2">
          <ProposalContext.Provider value={{ commonProps, proposalInfo: snapshotProposal }}>

            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2 lg:col-start-1">
                {/* Content */}
                <section aria-labelledby="proposal-title" onMouseDown={() => setSelectedVoter('')}>
                  <ProposalContent body={commonProps.body} />
                </section>

                {/* Display Options if not basic (For Against) */}
                <section aria-labelledby="options-title">
                  {snapshotProposal && ['approval', 'ranked-choice', 'quadratic', 'weighted'].includes(snapshotProposal.type) && (
                    <div className="mt-6 flow-root">
                      <ProposalOptions proposal={snapshotProposal} />
                    </div>
                  )}
                </section>
              </div>

              <section aria-labelledby="stats-title" className="lg:col-span-1 lg:col-start-3">
                <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6 sticky top-6 bottom-6 opacity-100" style={{
                  maxHeight: 'calc(100vh - 9rem)'
                }}>


                  <button onClick={() => {
                    if (query.sortBy === "time") {
                      setQuery({ sortBy: "vp" })
                    } else {
                      setQuery({ sortBy: "time" })
                    }
                  }} className="text-lg font-medium">

                    Votes
                    <span className="ml-2 text-center text-gray-300 text-xs">
                      sort by {query.sortBy}
                    </span>

                  </button>

                  {!snapshotProposal && (
                    <div className="mt-2 space-y-4">


                      <ColorBar greenScore={proposal?.temperatureCheckVotes?.[0] || 0} redScore={proposal?.temperatureCheckVotes?.[1] || 0} threshold={10} />

                      {proposal.status !== "Cancelled" && (
                        <>
                          <p>Temp check voting open on Discord now.</p>

                          <a href={openInDiscord(proposal.discussionThreadURL) || '#'} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full">
                            Vote on Discord
                          </a>

                          <Link
                            href={{
                              pathname: '/edit',
                              query: editPageQuery,
                            }}
                          >
                            <a className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full">
                              Edit Proposal
                            </a>
                          </Link>
                        </>
                      )}

                      {proposal.status === "Cancelled" && (
                        <>
                          <p>Temp check failed, this proposal has been cancelled.</p>

                          <a href={openInDiscord(proposal.discussionThreadURL) || '#'} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full">
                            Check discussion on Discord
                          </a>
                        </>
                      )}

                    </div>
                  )}

                  {snapshotProposal && (
                    <ProposalVotes selectedVoter={selectedVoter} setSelectedVoter={setSelectedVoter} />
                  )}
                </div>
              </section>
            </div>

            <ScrollToBottom />
          </ProposalContext.Provider>
        </main>
      </div>
    </>
  )
}

function ProposalContent({ body }: { body: string }) {
  const { commonProps } = useContext(ProposalContext);

  return (
    <div className="">
      <div className="px-4 py-5 sm:px-6 flex flex-col">
        <h1 id="applicant-information-title" className="text-3xl font-medium">
          {commonProps.title}
        </h1>

        <p className="text-sm text-gray-500 text-right">
          by&nbsp;
          <FormattedAddress address={commonProps.author} style="text-gray-500" overrideURLPrefix="/snapshot/profile/" openInNewWindow={false} />
        </p>

        {/* Metadata */}
        <div className="my-4 border bg-gray-100 rounded-md px-4 py-5 sm:px-6">
          <h2 className="text-gray-500 mb-3">Metadata</h2>

          <div className="grid grid-cols-2 gaps-4">
            {commonProps.ipfs && (
              <>
                <span className="font-medium">IPFS:</span>
                <a target="_blank" rel="noreferrer" href={`https://snapshot.mypinata.cloud/ipfs/${commonProps.ipfs}`}>#bafkrei<ExternalLinkIcon className="h-3 w-3 inline text-xs" /></a>
              </>
            )}

            <span className="font-medium">Start date:</span>
            <span>{format(toDate(commonProps.created * 1000), "LLL dd, u KK:mm a")}</span>

            {commonProps.end > 0 && (
              <>
                <span className="font-medium">End date:</span>
                <span>{format(toDate(commonProps.end * 1000), "LLL dd, u KK:mm a")}</span>
              </>
            )}

            {commonProps.snapshot && (
              <>
                <span className="font-medium">Snapshot:</span>
                <a target="_blank" rel="noreferrer" href={`https://etherscan.io/block/${commonProps.snapshot}`}>{commonProps.snapshot}<ExternalLinkIcon className="h-3 w-3 inline text-xs" /></a>
              </>
            )}

            {commonProps.payout && (
              <>
                <span className="font-medium">Payout:</span>

                {commonProps.payout.project && (
                  <span>
                    Pay&nbsp;<ResolvedProject version={2} projectId={commonProps.payout.project} />{` $${commonProps.payout.amountUSD} for ${commonProps.payout.count} cycles`}
                  </span>
                )}

                {commonProps.payout.address && (
                  <span>
                    Pay&nbsp;<FormattedAddress address={commonProps.payout.address} />{` $${commonProps.payout.amountUSD} for ${commonProps.payout.count} cycles`}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>



      <div className="px-4 py-5 sm:px-6">
        <article className="prose prose-lg prose-indigo mx-auto text-gray-500 break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{body}</ReactMarkdown>
        </article>
      </div>
    </div>
  )
}

// BasicVoting: For Against Abstain
const SUPPORTED_VOTING_TYPES_FOR_GROUP = ["basic", "single-choice", "approval"]

function ProposalOptions({ proposal, isOverview = false }:
  { proposal: SnapshotProposal, isOverview?: boolean }) {

  const { loading, data, error } = useProposalVotes(proposal, 0, "created", "", isOverview, proposal.votes);

  let scores = proposal?.scores
    ?.map((score, index) => { return { score, index } })
    .filter((o) => o.score > 0)
    // sort by score desc
    .sort((a, b) => b.score - a.score)

  const displayVotesByGroup = SUPPORTED_VOTING_TYPES_FOR_GROUP.includes(proposal.type);
  let votesGroupByChoice: { [choice: string]: number } = {};
  if (!isOverview && displayVotesByGroup) {
    // iterate votesData and group by choice
    votesGroupByChoice = data?.votesData.reduce((acc, vote) => {
      const choice = vote.choice;
      if (!acc[choice]) {
        acc[choice] = 0;
      }
      acc[choice]++;
      return acc;
    }, {});
  }

  return (
    <dl className="m-2 grid grid-cols-1 gap-5">
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
              content={`${(score * 100 / proposal.scores_total).toFixed(2)}%`}
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
                  {(score * 100 / proposal.scores_total).toFixed()}%
                </span>
              )}

            </Tooltip>
          </div>
        ))}
    </dl>
  )
}

function ProposalVotes({ selectedVoter, setSelectedVoter }) {

  const { proposalInfo } = useContext(ProposalContext);
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    withField: withDefault(createEnumParam(["reason", "app"]), "")
  });

  const { loading, data, error, refetch } = useProposalVotes(proposalInfo, Math.max((query.page - 1) * VOTES_PER_PAGE, 0), query.sortBy as "created" | "vp", query.withField as "reason" | "app" | "");

  const proposalType = proposalInfo.type;

  if (['approval', 'ranked-choice', 'quadratic', 'weighted'].includes(proposalType)) {
    return (
      <div className="flex flex-col" style={{
        height: 'calc(100vh - 12rem)'
      }}>
        <div className="overflow-y-scroll pt-5 grow">
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
            <VoterProfile space="jbdao.eth" proposal={proposalInfo.id} voter={selectedVoter} close={() => setSelectedVoter('')} />

            {loading && "loading..."}
            {data?.votesData?.map((vote) => (
              <li key={vote.id}>
                <div className="flex flex-col" onMouseEnter={() => setSelectedVoter(vote.voter)}>
                  <div className="text-sm">
                    <div>
                      <FormattedAddress address={vote.voter} style="text-gray-900" overrideURLPrefix="https://juicetool.xyz/snapshot/profile/" openInNewWindow={true} />
                    </div>

                    <div className="text-xs text-slate-700 font-semibold">
                      {`${formatNumber(vote.vp)} (${(vote.vp * 100 / proposalInfo?.scores_total).toFixed()}%)`} total
                    </div>

                    <div className="text-sm text-gray-600 py-2">
                      {(processChoices(proposalInfo.type, vote.choice) as string[]).map((choice, idx) => (
                        <p key={`${vote.id} - ${idx}`}>{choice}</p>
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
        </div>

        <NewVote refetch={refetch} />
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{
      height: 'calc(100vh - 12rem)'
    }}>
      <div className="overflow-y-scroll pt-5 grow">
        <div className="">
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
          <VoterProfile space="jbdao.eth" proposal={proposalInfo.id} voter={selectedVoter} close={() => setSelectedVoter('')} />

          {loading && "loading..."}
          {data?.votesData?.map((vote) => (
            <li key={vote.id}>
              <div className="flex flex-col" onMouseEnter={() => setSelectedVoter(vote.voter)}>
                <div className="text-sm flex justify-between">
                  <div>
                    <div className="inline">
                      <FormattedAddress address={vote.voter} style="text-gray-900" noLink={true} />
                    </div>

                    &nbsp;
                    <span className={classNames(
                      getColorOfChoice(processChoices(proposalInfo.type, vote.choice) as string),
                      ''
                    )}>
                      voted {processChoices(proposalInfo.type, vote.choice) as string}
                    </span>
                  </div>

                  <div>
                    {`${formatNumber(vote.vp)} (${(vote.vp * 100 / proposalInfo?.scores_total).toFixed()}%)`}
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
      </div>

      <NewVote refetch={refetch} />
    </div>
  )
}

function NewVote({ refetch }: { refetch: (option?: any) => void }) {
  const { proposalInfo } = useContext(ProposalContext);
  // state
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [buttonLabel, setButtonLabel] = useState('Vote');
  // external hook
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    if (proposalInfo?.state !== 'active') {
      setButtonLabel('Voting Closed');
    } else if (isConnected) {
      setButtonLabel('Vote');
    } else {
      setButtonLabel('Connect Wallet');
    }
  }, [isConnected, proposalInfo?.state]);

  return (
    <div className="my-4">
      <button id="vote" className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full"
        onClick={() => {
          if (isConnected) {
            setModalIsOpen(true);
          } else {
            openConnectModal();
          }
        }}
        disabled={proposalInfo?.state !== 'active'}>

        <span>
          {buttonLabel}
        </span>
      </button>

      {proposalInfo?.choices && (
        <VotingModal modalIsOpen={modalIsOpen} closeModal={() => setModalIsOpen(false)} address={address} spaceId='jbdao.eth' proposal={proposalInfo} spaceHideAbstain={true} refetch={refetch} />
      )}
    </div>
  )
}
