import { fetchProposalInfo, SnapshotProposal, useProposalVotes, VOTES_PER_PAGE } from "../../hooks/snapshot/Proposals";
import { useAccount } from 'wagmi'
import SiteNav from "../../components/SiteNav";
import ReactMarkdown from "react-markdown";
import { Tooltip } from 'flowbite-react';
import FormattedAddress from "../../components/FormattedAddress";
import { format, toDate } from "date-fns";
import { createContext, useContext, useEffect, useState } from "react";
import VotingModal from "../../components/VotingModal";
import { withDefault, NumberParam, createEnumParam, useQueryParams, StringParam } from "next-query-params";
import { processChoices } from "../../libs/snapshotUtil";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import ColorBar from "../../components/ColorBar";
import { fetchProposal } from "../../hooks/NanceHooks";
import { getLastSlash } from "../../libs/nance";
import { Proposal, Payout, Action, Transfer, CustomTransaction, Reserve } from "../../models/NanceTypes";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Custom404 from "../404";
import VoterProfile from "../../components/VoterProfile";
import ScrollToBottom from "../../components/ScrollToBottom";
import { ExternalLinkIcon } from "@heroicons/react/solid";
import ResolvedProject from "../../components/ResolvedProject";
import { NANCE_API_URL, NANCE_DEFAULT_SPACE } from "../../constants/Nance";
import { CONTRACT_MAP } from "../../constants/Contract";
import ResolvedContract from "../../components/ResolvedContract";
import JBSplitEntry from "../../components/juicebox/JBSplitEntry";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import Footer from "../../components/Footer";

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

function getDomain(url) {
  // parse data between https:// and .<ending> to get name of domain, dont include www. or .<ending> in the name
  const domain = url.replace(/(https?:\/\/)?(www\.)?/i, '').split('.')[0];
  return domain;
}

export async function getServerSideProps(context) {
  let snapshotProposal: SnapshotProposal;
  let proposal: Proposal;

  // check proposal parameter type
  const proposalParam: string = context.params.proposal;
  const spaceParam: string = context.query.overrideSpace || NANCE_DEFAULT_SPACE;;

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
  snapshot: string;
  ipfs: string;
  discussion: string;
  governanceCycle: number;
  uuid: string;
  actions: Action[];
}

const ProposalContext = createContext<{ commonProps: ProposalCommonProps, proposalInfo: SnapshotProposal }>(undefined);

export default function NanceProposalPage({ proposal, snapshotProposal }: { proposal: Proposal | undefined, snapshotProposal: SnapshotProposal | undefined }) {
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    withField: withDefault(createEnumParam(["reason", "app"]), ""),
    overrideSpace: StringParam
  });
  const editPageQuery = {
    proposalId: proposal?.hash
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
    ipfs: proposal?.ipfsURL || "",
    discussion: proposal?.discussionThreadURL || "",
    governanceCycle: proposal.governanceCycle || 0,
    uuid: proposal.hash || "",
    actions: proposal.actions
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
                <section aria-labelledby="proposal-title">
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
                      sort by {query.sortBy === "vp" ? "voting power" : "time"}
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
                    <ProposalVotes />
                  )}
                </div>
              </section>
            </div>

            <ScrollToBottom />
          </ProposalContext.Provider>
        </main>
      </div>

      <Footer />
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
          <h2 className="text-gray-500 mb-3"><a href={`${NANCE_API_URL}/${NANCE_DEFAULT_SPACE}/proposal/${commonProps.uuid}`}>Metadata</a></h2>

          <div className="grid grid-cols-2 gaps-4">

            {commonProps.governanceCycle && (
              <>
                <span className="font-medium">Governance Cycle:</span>
                <span>{commonProps.governanceCycle}</span>
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

            {commonProps.discussion && (
              <>
                <span className="font-medium">Discussion:</span>
                <a target="_blank" rel="noreferrer" href={openInDiscord(commonProps.discussion)}>{getDomain(commonProps.discussion)}<ExternalLinkIcon className="h-3 w-3 inline text-xs" /></a>
              </>
            )}

            {commonProps.ipfs && (
              <>
                <span className="font-medium">IPFS:</span>
                <a target="_blank" rel="noreferrer" href={`${commonProps.ipfs}`}>{getLastSlash(commonProps.ipfs).slice(0,10)}<ExternalLinkIcon className="h-3 w-3 inline text-xs" /></a>
              </>
            )}

            {commonProps.actions && (
              <>
                <p className="font-medium col-span-2">Actions:</p>

                <div className="col-span-2 flex flex-col mt-2 w-full space-y-2">
                  {commonProps.actions.map((action, index) => (
                    <div key={index} className="ml-2 flex space-x-2 w-full break-words">
                      <span className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800">
                        {action.type}
                        {/* {action.type === "Reserve" && (
                          <span>
                            (Total: {(action.payload as Reserve).splits.reduce((acc, obj) => acc + obj.percent, 0) * 100 / JBConstants.TotalPercent.Splits[2]}%)
                          </span>
                        )} */}
                      </span>

                      {action.type === "Transfer" && (
                        <span className="line-clamp-5">
                          {formatUnits(BigNumber.from((action.payload as Transfer).amount), getContractDecimal((action.payload as Transfer).contract))}
                          &nbsp;{getContractLabel((action.payload as Transfer).contract)}
                          &nbsp;to
                          <FormattedAddress address={(action.payload as Transfer).to} style="inline ml-1" />
                        </span>
                      )}

                      {action.type === "Payout" && !(action.payload as Payout).project && (
                        <span className="line-clamp-5">
                          ${(action.payload as Payout).amountUSD}
                          &nbsp;to
                          <FormattedAddress address={(action.payload as Payout).address} style="inline ml-1" />
                          &nbsp;{` for ${(action.payload as Payout).count} cycles`}
                        </span>
                      )}

                      {action.type === "Payout" && (action.payload as Payout).project && (
                        <span className="line-clamp-5">
                          ${(action.payload as Payout).amountUSD}
                          &nbsp;to
                          <ResolvedProject version={2} projectId={(action.payload as Payout).project} style="inline ml-1" />
                          {` for ${(action.payload as Payout).count} cycles`}
                        </span>
                      )}

                      {action.type === "Custom Transaction" && (
                        <span className="line-clamp-5">
                          <ResolvedContract address={(action.payload as CustomTransaction).contract} style="inline ml-1" />
                          &#46;
                          <a href={`https://etherfunk.io/address/${(action.payload as CustomTransaction).contract}?fn=${(action.payload as CustomTransaction).functionName?.split("(")[0]}`} rel="noopener noreferrer" target="_blank" className="hover:underline inline">
                            {(action.payload as CustomTransaction).functionName?.split("(")[0]}
                            {`(${Object.values((action.payload as CustomTransaction).args || {}).join(",")}) {value: ${(action.payload as CustomTransaction).value}}`}
                          </a>
                        </span>
                      )}

                      {action.type === "Reserve" && (
                        <div className="flex flex-col">
                          {(action.payload as Reserve).splits.sort((a, b) => b.percent - a.percent).map(
                            (split, index) => (
                              <JBSplitEntry key={index} beneficiary={split.beneficiary} allocator={split.allocator} projectId={split.projectId.toString()} percent={split.percent.toString()} preferAddToBalance={split.preferAddToBalance} preferClaimed={split.preferClaimed} style="grid grid-cols-3 gap-6" />
                            )
                          )}
                        </div>
                      )}

                    </div>
                  ))}
                </div>
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

function getContractLabel(address: string) {
  if(CONTRACT_MAP.ETH === address) return "ETH"
  else if(CONTRACT_MAP.JBX === address) return "JBX"
  else if(CONTRACT_MAP.USDC === address) return "USDC"
  else return `Unknown(${address})`
}

function getContractDecimal(address: string) {
  if(CONTRACT_MAP.ETH === address) return 18
  else if(CONTRACT_MAP.JBX === address) return 18
  else if(CONTRACT_MAP.USDC === address) return 6
  else return `Unknown(${address})`
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

function ProposalVotes() {

  const { proposalInfo } = useContext(ProposalContext);
  const [selectedVoter, setSelectedVoter] = useState<string>('');
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    withField: withDefault(createEnumParam(["reason", "app"]), "")
  });

  const { loading, data, error, refetch } = useProposalVotes(proposalInfo, Math.max((query.page - 1) * VOTES_PER_PAGE, 0), query.sortBy as "created" | "vp", query.withField as "reason" | "app" | "");

  const proposalType = proposalInfo.type;
  const isSimpleVoting = !['approval', 'ranked-choice', 'quadratic', 'weighted'].includes(proposalType);

  return (
    <div className="flex flex-col" style={{
      height: 'calc(100vh - 12rem)'
    }}>
      <div className="overflow-y-scroll pt-5 grow">
        <div className="">
          {isSimpleVoting && (
            <>
              <div className="flex justify-between">
                <p className="text-green-500 text-sm">FOR {formatNumber(proposalInfo.scores[0] || 0)}</p>
                <p className="text-red-500 text-sm">AGAINST {formatNumber(proposalInfo.scores[1] || 0)}</p>
              </div>

              <div className='p-3 text-sm text-gray-500'>
                <ColorBar greenScore={proposalInfo.scores[0] || 0} redScore={proposalInfo.scores[1] || 0} noTooltip />
              </div>
            </>
          )}

          {!isSimpleVoting && (
            <>
              <div className="flex justify-between">
                <p className="text-green-500 text-sm">VOTES {formatNumber(proposalInfo.scores_total || 0)}</p>
              </div>

              <div className='p-3 text-sm text-gray-500'>
                <ColorBar greenScore={proposalInfo.scores_total || 0} redScore={0} noTooltip />
              </div>
            </>
          )}

          <div className="flex justify-between">
            <p className="text-sm">QUORUM {formatNumber(proposalInfo.quorum || 0)}</p>
            <p className="text-sm">VOTER {formatNumber(proposalInfo.votes || 0)}</p>
          </div>
        </div>

        <ul role="list" className="space-y-2 pt-2">
          {loading && "loading..."}
          {data?.votesData?.map((vote) => (
            <li key={vote.id}>
              <div className={classNames(
                "flex flex-col",
                vote.voter === selectedVoter ? "bg-blue-100 rounded-lg shadow p-4" : ""
              )}>
                <div className="cursor-pointer" onClick={() => vote.voter === selectedVoter ? setSelectedVoter("") : setSelectedVoter(vote.voter)}>
                  {isSimpleVoting && (
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
                  )}

                  {!isSimpleVoting && (
                    <div className="text-sm flex flex-col">
                      <div>
                        <FormattedAddress address={vote.voter} style="text-gray-900" noLink={true} />
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
                  )}


                  {
                    vote.reason && (
                      <div className="text-sm text-gray-600">
                        {vote.reason}
                      </div>
                    )
                  }
                </div>

                <VoterProfile space="jbdao.eth" proposal={proposalInfo.id} voter={vote.voter} isOpen={vote.voter === selectedVoter} />
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
