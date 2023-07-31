import { fetchProposalInfo, SnapshotProposal, useProposalVotes, VOTES_PER_PAGE } from "../../../hooks/snapshot/Proposals";
import SiteNav from "../../../components/SiteNav";
import { Tooltip } from 'flowbite-react';
import FormattedAddress from "../../../components/FormattedAddress";
import { format, toDate } from "date-fns";
import { createContext, useContext, useState, Fragment } from "react";
import { withDefault, NumberParam, createEnumParam, useQueryParams } from "next-query-params";
import { processChoices } from "../../../libs/snapshotUtil";
import ColorBar from "../../../components/ColorBar";
import { useProposal, useProposalDelete, useProposalUpload, useSpaceInfo } from "../../../hooks/NanceHooks";
import { canEditProposal, getLastSlash } from "../../../libs/nance";
import { Proposal, Payout, Action, Transfer, CustomTransaction, Reserve, ProposalDeleteRequest, ProposalUploadRequest, extractFunctionName, parseFunctionAbiWithNamedArgs } from "../../../models/NanceTypes";
import Link from "next/link";
import Custom404 from "../../404";
import VoterProfile from "../../../components/VoterProfile";
import ScrollToBottom from "../../../components/ScrollToBottom";
import { CheckIcon, ChevronDownIcon, ArrowTopRightOnSquareIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from "@heroicons/react/24/solid";
import ResolvedProject from "../../../components/ResolvedProject";
import { NANCE_API_URL, NANCE_DEFAULT_SPACE } from "../../../constants/Nance";
import { CONTRACT_MAP } from "../../../constants/Contract";
import ResolvedContract from "../../../components/ResolvedContract";
import JBSplitEntry from "../../../components/juicebox/JBSplitEntry";
import Footer from "../../../components/Footer";
import { ArrowLeftCircleIcon, ArrowRightCircleIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { Disclosure, Listbox, Transition } from "@headlessui/react";
import { numToPrettyString } from "../../../libs/NumberFormatter";
import { useRouter } from "next/router";
import Notification from "../../../components/Notification";
import { getToken } from "next-auth/jwt";
import { BigNumber } from "ethers";
import NewVoteButton from "../../../components/NewVoteButton";
import MarkdownWithTOC from "../../../components/MarkdownWithTOC";
import { useSession } from "next-auth/react";
import { classNames } from "../../../libs/tailwind";

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact", compactDisplay: "short" });
const formatNumber = (num: number) => formatter.format(num);

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
};

function openInDiscord(url: string) {
  try {
    // use URL object to replace https:// with discord://
    const discordUrl = new URL(url);
    discordUrl.protocol = 'discord:';
    return discordUrl.toString();
  } catch (error) {
    return url;
  }
}

function getDomain(url: string) {
  // parse data between https:// and .<ending> to get name of domain, dont include www. or .<ending> in the name
  const domain = url.replace(/(https?:\/\/)?(www\.)?/i, '').split('.')[0];
  return domain;
}

export async function getServerSideProps({ req, params }: any) {
  let snapshotProposal: SnapshotProposal | null = null;
  let proposal: Proposal;

  // check proposal parameter type
  const proposalParam: string = params.proposal;
  const spaceParam: string = params.space;

  // Attach the JWT token to the request headers
  const token = await getToken({ req, raw: true });
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const proposalResponse = await fetch(`${NANCE_API_URL}/${spaceParam}/proposal/${proposalParam}`, {headers}).then(res => res.json());
  proposal = proposalResponse.data;
  const proposalHash = getLastSlash(proposal?.voteURL);
  if (proposalHash) {
    snapshotProposal = await fetchProposalInfo(proposalHash);
  }

  // Pass data to the page via props
  return {
    props: {
      space: spaceParam,
      proposal: proposal || null,
      snapshotProposal: snapshotProposal
    }
  };
}

interface ProposalCommonProps {
  space: string;
  snapshotSpace: string;
  status: string;
  title: string;
  author: string;
  coauthors: string[];
  body: string;
  created: number;
  end: number;
  snapshot: string;
  snapshotHash: string;
  ipfs: string;
  discussion: string;
  governanceCycle: number;
  uuid: string;
  actions: Action[];
  proposalId: number;
}

const ProposalContext = createContext<{ commonProps: ProposalCommonProps | undefined, proposalInfo: SnapshotProposal | undefined }>({
  commonProps: undefined,
  proposalInfo: undefined
});

const ProposalStatus = [
  {title: "Archive", description: "Archive your proposal and exit from governance process."},
  {title: "Delete", description: "Delete your proposal and this can't be undo."},
];

export default function NanceProposalPage({ space, proposal, snapshotProposal }: { space: string, proposal: Proposal | undefined, snapshotProposal: SnapshotProposal | null }) {
  const router = useRouter();
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    withField: withDefault(createEnumParam(["reason", "app"]), ""),
    filterBy: withDefault(createEnumParam(["for", "against"]), ""),
  });
  const editPageQuery = {
    proposalId: proposal?.hash
  };

  const { data: session, status } = useSession();
  const [selected, setSelected] = useState(ProposalStatus[0]);
  const { data: spaceInfo } = useSpaceInfo({space});
  const { isMutating, error: uploadError, trigger, data, reset } = useProposalUpload(space, proposal?.hash, router.isReady);
  const { trigger: deleteTrigger, reset: deleteReset, error: deleteError } = useProposalDelete(space, proposal?.hash, router.isReady);
  const error = uploadError || deleteError;

  const archiveProposal = async () => {
    const payload: any = {
      ...proposal,
      status: "Archived"
    };
    console.debug("📚 Nance.archiveProposal.onSubmit ->", { payload });

    // send to API endpoint
    reset();
    const req: ProposalUploadRequest = {
      proposal: payload
    };
    console.debug("📗 Nance.archiveProposal.submit ->", req);
    trigger(req)
      .then(res => router.push(space === NANCE_DEFAULT_SPACE ? `/p/${res?.data.hash}` : `/s/${space}/${res?.data.hash}`))
      .catch((err) => {
        console.warn("📗 Nance.archiveProposal.onUploadError ->", err);
      });
  };

  const deleteProposal = async () => {
    const hash = proposal?.hash;
    deleteReset();
    if (hash) {
      const req: ProposalDeleteRequest = {
        hash
      };
      console.debug("📗 Nance.deleteProposal.onDelete ->", req);
      deleteTrigger(req)
        .then(() => router.push(space === NANCE_DEFAULT_SPACE ? `/` : `/s/${space}`))
        .catch((err) => {
          console.warn("📗 Nance.deleteProposal.onDeleteError ->", err);
        });
    }
  };

  // this page need proposal to work
  if (!proposal) {
    return <Custom404 errMsg="Proposal not found on Nance platform, you can reach out in Discord or explore on the home page." />;
  }

  const commonProps: ProposalCommonProps = {
    space,
    snapshotSpace: spaceInfo?.data?.snapshotSpace || "",
    status: snapshotProposal?.state || proposal.status,
    title: snapshotProposal?.title || proposal.title,
    author: proposal.authorAddress || snapshotProposal?.author || "",
    coauthors: proposal.coauthors || [],
    body: snapshotProposal?.body || proposal.body || "",
    created: snapshotProposal?.start || (proposal.date ? Math.floor(new Date(proposal.date).getTime() / 1000) : 0),
    end: snapshotProposal?.end || 0,
    snapshot: snapshotProposal?.snapshot || "",
    snapshotHash: proposal.voteURL || "",
    ipfs: snapshotProposal?.ipfs || proposal.ipfsURL || "",
    discussion: proposal.discussionThreadURL || "",
    governanceCycle: proposal.governanceCycle || 0,
    uuid: proposal.hash || "",
    actions: proposal.actions,
    proposalId: proposal.proposalId || 0
  };

  return (
    <>
      <SiteNav
        pageTitle={`${commonProps.title}`}
        description={commonProps.body?.slice(0, 140) || 'No content'}
        image={`https://cdn.stamp.fyi/space/jbdao.eth?w=1200&h=630`}
        space={space}
        proposalId={proposal?.hash}
        withWallet />

      <div className="min-h-full">
        <main className="py-2">
          <ProposalContext.Provider value={{ commonProps, proposalInfo: snapshotProposal || undefined }}>
            <div className="mx-auto mt-4 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
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
                      setQuery({ sortBy: "vp" });
                    } else {
                      setQuery({ sortBy: "time" });
                    }
                  }} className="text-lg font-medium">

                    Votes
                    <span className="ml-2 text-center text-gray-300 text-xs">
                      sort by {query.sortBy === "vp" ? "voting power" : "time"}
                    </span>

                  </button>

                  {!snapshotProposal && (
                    <div className="mt-2 space-y-4">
                      {error &&
                        <Notification title="Error" description={error.error_description || error.message || error} show={true} close={() => {
                          reset(); deleteReset();
                        }} checked={false} />
                      }

                      <ColorBar greenScore={proposal?.temperatureCheckVotes?.[0] || 0} redScore={proposal?.temperatureCheckVotes?.[1] || 0} threshold={10} />

                      {proposal.status === "Temperature Check" && (
                        <>
                          <p>Temp check voting open on Discord now.</p>

                          <a href={openInDiscord(proposal.discussionThreadURL) || '#'} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full">
                            Vote on Discord
                          </a>
                        </>
                      )}
                      
                      {canEditProposal(proposal.status) && status === "authenticated" && (
                        <Link
                          legacyBehavior
                          href={{
                            pathname: space === NANCE_DEFAULT_SPACE ? '/edit' : `/s/${space}/edit`,
                            query: editPageQuery,
                          }}
                        >
                          <a className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full">
                            Edit Proposal
                          </a>
                        </Link>
                      )}

                      {canEditProposal(proposal.status) && status === "authenticated" && (
                        <Listbox value={selected} onChange={setSelected} as="div">
                          {({ open }) => (
                            <>
                              <Listbox.Label className="sr-only">Change published status</Listbox.Label>
                              <div className="relative">
                                <div className="inline-flex divide-x divide-gray-700 rounded-md shadow-sm w-full">
                                  <button onClick={() => {
                                    if(selected.title === "Archive") {
                                      archiveProposal();
                                    } else if(selected.title === "Delete") {
                                      deleteProposal();
                                    }
                                  }} className="inline-flex items-center justify-center rounded-none rounded-l-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full">
                                    {selected.title}
                                  </button>
                                  <Listbox.Button className="inline-flex items-center rounded-l-none rounded-r-md bg-gray-600 p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-50">
                                    <span className="sr-only">Change proposal status</span>
                                    <ChevronDownIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                  </Listbox.Button>
                                </div>
          
                                <Transition
                                  show={open}
                                  as={Fragment}
                                  leave="transition ease-in duration-100"
                                  leaveFrom="opacity-100"
                                  leaveTo="opacity-0"
                                >
                                  <Listbox.Options className="absolute right-0 z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {ProposalStatus.map((option) => (
                                      <Listbox.Option
                                        key={option.title}
                                        className={({ active }) =>
                                          classNames(
                                            active ? 'bg-gray-600 text-white' : 'text-gray-900',
                                            'cursor-default select-none p-4 text-sm'
                                          )
                                        }
                                        value={option}
                                      >
                                        {({ selected, active }) => (
                                          <div className="flex flex-col">
                                            <div className="flex justify-between">
                                              <p className={selected ? 'font-semibold' : 'font-normal'}>{option.title}</p>
                                              {selected ? (
                                                <span className={active ? 'text-white' : 'text-gray-600'}>
                                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                              ) : null}
                                            </div>
                                            <p className={classNames(active ? 'text-gray-200' : 'text-gray-500', 'mt-2')}>
                                              {option.description}
                                            </p>
                                          </div>
                                        )}
                                      </Listbox.Option>
                                    ))}
                                  </Listbox.Options>
                                </Transition>
                              </div>
                            </>
                          )}
                        </Listbox>
                      )}

                      {proposal.status === "Cancelled" && (
                        <>
                          <p>Temp check failed, this proposal has been cancelled.</p>

                          <a href={openInDiscord(proposal.discussionThreadURL) || '#'} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full">
                            Check discussion on Discord
                          </a>
                        </>
                      )}

                      {proposal.status === "Revoked" && (
                        <>
                          <p>This proposal has been revoked by author.</p>

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
  );
}

function ProposalContent({ body }: { body: string }) {
  let { commonProps } = useContext(ProposalContext);
  commonProps = commonProps as ProposalCommonProps;

  return (
    <div className="">
      <div className="px-4 py-5 sm:px-6 flex flex-col">
        <Link href={`/s/${commonProps.space}`} className="flex mb-4 rounded-md border-1 shadow-sm w-fit p-2">
          <ArrowUturnLeftIcon className="h-5 w-5 mr-1" />
          Back
        </Link>

        <h1 id="applicant-information-title" className="text-3xl font-medium">
          {canEditProposal(commonProps.status) ? `[${commonProps.status}] ` : ""}{commonProps.title}
        </h1>

        <p className="text-sm text-gray-500 text-right">
          by&nbsp;
          <FormattedAddress address={commonProps.author} style="text-gray-500" overrideURLPrefix="/u/" openInNewWindow={false} />
        </p>
        { commonProps.coauthors.length > 0 && (
          <p className="text-sm text-gray-500 text-right">
            co-authored by&nbsp;
            {commonProps.coauthors.map((coauthor, i) => (
              <Fragment key={i}>
                <FormattedAddress address={coauthor} style="text-gray-500" overrideURLPrefix="/u/" openInNewWindow={false} />
                {i < commonProps!.coauthors.length - 1 && ', '}
              </Fragment>
            ))}
          </p>
        )}

        {/* Metadata */}
        <div className="my-4 border bg-gray-100 rounded-md px-4 py-5 sm:px-6">
          <h2 className="text-gray-500 mb-3">
            Metadata 
            <a href={`${NANCE_API_URL}/${commonProps.space}/proposal/${commonProps.uuid}`} className="ml-2">
              <ArrowTopRightOnSquareIcon  className="h-4 w-4 inline" />
            </a>
          </h2>

          <div className="grid grid-cols-2 gaps-4">
            {commonProps.actions && (
              <>
                <p className="font-medium col-span-2">
                  Actions:
                  {commonProps.actions.length == 0 && (
                    <span className="ml-2 inline-flex items-center rounded-md bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800">
                      No action
                    </span>
                  )}
                </p>

                <div className="col-span-2 flex flex-col mt-2 w-full space-y-2">
                  {commonProps.actions.map((action, index) => (
                    <div key={index} className="ml-2 flex space-x-2 w-full break-words">
                      <span className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 h-min w-min">
                        {action.type}
                        {/* {action.type === "Reserve" && (
                          <span>
                            (Total: {(action.payload as Reserve).splits.reduce((acc, obj) => acc + obj.percent, 0) * 100 / JBConstants.TotalPercent.Splits[2]}%)
                          </span>
                        )} */}
                      </span>

                      {action.type === "Transfer" && (
                        <span className="line-clamp-5">
                          { numToPrettyString(Number((action.payload as Transfer).amount)) }
                          &nbsp;{getContractLabel((action.payload as Transfer).contract)}
                          &nbsp;to
                          <FormattedAddress address={(action.payload as Transfer).to} style="inline ml-1" />
                        </span>
                      )}

                      {action.type === "Payout" && !(action.payload as Payout).project && (
                        <span className="line-clamp-5">
                          ${(action.payload as Payout).amountUSD.toLocaleString()}
                          &nbsp;to
                          <FormattedAddress address={(action.payload as Payout).address} style="inline ml-1" />
                          &nbsp;{` for ${(action.payload as Payout).count} cycles`}
                        </span>
                      )}

                      {action.type === "Payout" && (action.payload as Payout).project && (
                        <span className="line-clamp-5">
                          ${(action.payload as Payout).amountUSD.toLocaleString()}
                          &nbsp;to
                          <ResolvedProject version={2} projectId={(action.payload as Payout).project} style="inline ml-1" />
                          {` for ${(action.payload as Payout).count} cycles`}
                        </span>
                      )}

                      {action.type === "Custom Transaction" && (
                        <span className="line-clamp-6">
                          <ResolvedContract address={(action.payload as CustomTransaction).contract} style="inline ml-1" />
                          &#46;
                          <a href={`https://etherfunk.io/address/${(action.payload as CustomTransaction).contract}?fn=${extractFunctionName((action.payload as CustomTransaction).functionName)}`} rel="noopener noreferrer" target="_blank" className="hover:underline inline">
                            {extractFunctionName((action.payload as CustomTransaction).functionName)}
                          </a>
                          
                          <span>{"("}</span>
                          <span>
                            {parseFunctionAbiWithNamedArgs((action.payload as CustomTransaction).functionName, (action.payload as CustomTransaction).args).map((pair: any, index: number) => (
                              <span key={index} className="ml-1 first:ml-0 after:content-[','] last:after:content-[''] text-gray-500 ">
                                <span className="inline-block">{pair[0]}</span>
                                <span>{`: ${pair[1]}`}</span>
                              </span>
                            ))}
                          </span>
                          <span>{")"}</span>

                          {BigNumber.from((action.payload as CustomTransaction).value).gt(0) && (
                            <span>
                              <span>{"{"}</span>
                              <span className="text-gray-500">value</span>
                              <span>{`: ${(action.payload as CustomTransaction).value}`}</span>
                              <span>{"}"}</span>
                            </span>
                          )}

                          <a href={`${NANCE_API_URL}/${commonProps?.space}/simulate/${action.uuid}`} className="ml-2">
                            <ArrowTopRightOnSquareIcon  className="h-4 w-4 inline" />
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

          <Disclosure>
            {({ open }) => (
              /* Use the `open` state to conditionally change the direction of an icon. */
              <>
                <Disclosure.Button className="mt-4 mb-2 p-1 rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                  {open ? <ArrowsPointingInIcon className="h-5 w-5" /> : <ArrowsPointingOutIcon className="h-5 w-5" />}
                </Disclosure.Button>
                <Disclosure.Panel className="grid grid-cols-2 gaps-4" as="div">
                  {commonProps!.governanceCycle && (
                    <>
                      <span className="font-medium">Governance Cycle:</span>
                      <span>{commonProps!.governanceCycle}</span>
                    </>
                  )}

                  <span className="font-medium">Start date:</span>
                  <span>{format(toDate(commonProps!.created * 1000), "LLL dd, u KK:mm a")}</span>

                  {commonProps!.end > 0 && (
                    <>
                      <span className="font-medium">End date:</span>
                      <span>{format(toDate(commonProps!.end * 1000), "LLL dd, u KK:mm a")}</span>
                    </>
                  )}

                  {commonProps!.snapshotSpace && commonProps!.snapshotHash && (
                    <>
                      <span className="font-medium">Snapshot:</span>
                      <a target="_blank" rel="noreferrer" href={`https://snapshot.org/#/${commonProps!.snapshotSpace}/proposal/${commonProps!.snapshotHash}`}>{commonProps!.snapshotHash.substring(0, 8)}<ArrowTopRightOnSquareIcon className="h-3 w-3 inline text-xs" /></a>
                    </>
                  )}

                  {commonProps!.snapshot && (
                    <>
                      <span className="font-medium">Block:</span>
                      <a target="_blank" rel="noreferrer" href={`https://etherscan.io/block/${commonProps!.snapshot}`}>{commonProps!.snapshot}<ArrowTopRightOnSquareIcon className="h-3 w-3 inline text-xs" /></a>
                    </>
                  )}

                  {commonProps!.discussion && (
                    <>
                      <span className="font-medium">Discussion:</span>
                      <a target="_blank" rel="noreferrer" href={openInDiscord(commonProps!.discussion)}>{getDomain(commonProps!.discussion)}<ArrowTopRightOnSquareIcon className="h-3 w-3 inline text-xs" /></a>
                    </>
                  )}

                  {commonProps!.ipfs && (
                    <>
                      <span className="font-medium">IPFS:</span>
                      <a target="_blank" rel="noreferrer" href={`https://snapshot.mypinata.cloud/ipfs/${commonProps!.ipfs}`}>{getLastSlash(commonProps!.ipfs).slice(0,7)}<ArrowTopRightOnSquareIcon className="h-3 w-3 inline text-xs" /></a>
                    </>
                  )}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </div>
      </div>

      <div className="px-4 sm:px-6">
        <MarkdownWithTOC body={body} />
      </div>

      <div className="px-4 py-5 sm:px-6 mt-4">
        <ProposalNavigator />
      </div>
    </div>
  );
}

function getContractLabel(address: string) {
  if(CONTRACT_MAP.ETH === address) return "ETH";
  else if(CONTRACT_MAP.JBX === address) return "JBX";
  else if(CONTRACT_MAP.USDC === address) return "USDC";
  else return `Unknown(${address})`;
}

function ProposalNavigator() {
  // pre load prev and next proposal
  let { commonProps } = useContext(ProposalContext);
  commonProps = commonProps as ProposalCommonProps;

  const proposalId = commonProps.proposalId;
  
  const { data: prevProp } = useProposal({space: commonProps.space, hash: (proposalId-1).toString()}, !!proposalId);
  const { data: nextProp } = useProposal({space: commonProps.space, hash: (proposalId+1).toString()}, !!proposalId);

  return (
    <div className="flex flex-col space-y-2 space-x-0 md:flex-row md:space-y-0 md:space-x-4 justify-between text-gray-500">
      {prevProp?.data?.title && (
        <a href={commonProps.space === NANCE_DEFAULT_SPACE ? `/p/${proposalId-1}` : `/s/${commonProps.space}/${proposalId-1}`} className="w-full md:w-1/2">
          <ArrowLeftCircleIcon className="h-5 w-5 inline"/> {prevProp?.data?.title}
        </a>
      )}

      {nextProp?.data?.title && (
        <a href={commonProps.space === NANCE_DEFAULT_SPACE ? `/p/${proposalId+1}` : `/s/${commonProps.space}/${proposalId+1}`}  className="w-full md:w-1/2">
          <ArrowRightCircleIcon className="h-5 w-5 inline"/> {nextProp?.data?.title}
        </a>
      )}
    </div>
  );
}

// BasicVoting: For Against Abstain
const SUPPORTED_VOTING_TYPES_FOR_GROUP = ["basic", "single-choice", "approval"];

function ProposalOptions({ proposal, isOverview = false }:
  { proposal: SnapshotProposal, isOverview?: boolean }) {

  const { loading, data, error } = useProposalVotes(proposal, 0, "created", "", isOverview, proposal.votes);

  let scores = proposal?.scores
    ?.map((score, index) => {
      return { score, index }; 
    })
    .filter((o) => o.score > 0)
    // sort by score desc
    .sort((a, b) => b.score - a.score);

  const displayVotesByGroup = SUPPORTED_VOTING_TYPES_FOR_GROUP.includes(proposal.type);
  let votesGroupByChoice: { [choice: string]: number } = {};
  if (!isOverview && displayVotesByGroup) {
    // iterate votesData and group by choice
    votesGroupByChoice = data?.votesData.reduce((acc: { [choice: string]: number }, vote) => {
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
  );
}

function ProposalVotes() {

  const { proposalInfo } = useContext(ProposalContext);
  const [selectedVoter, setSelectedVoter] = useState<string>('');
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    withField: withDefault(createEnumParam(["reason", "app"]), ""),
    filterBy: withDefault(createEnumParam(["for", "against"]), ""),
  });

  const { loading, data, error, refetch } = useProposalVotes(proposalInfo, Math.max((query.page - 1) * VOTES_PER_PAGE, 0), query.sortBy as "created" | "vp", query.withField as "reason" | "app" | "");

  const proposalType = proposalInfo?.type ?? "";
  const isSimpleVoting = !['approval', 'ranked-choice', 'quadratic', 'weighted'].includes(proposalType);

  let votes = data?.votesData;
  if (query.filterBy === "for") {
    votes = votes.filter((v) => v.choice === "For");
  } else if (query.filterBy === "against") {
    votes = votes.filter((v) => v.choice === "Against");
  }

  return (
    <div className="flex flex-col" style={{
      maxHeight: 'calc(100vh - 12rem)'
    }}>
      <div className="overflow-y-scroll pt-5">
        <div className="">
          {isSimpleVoting && (
            <>
              <div className="flex justify-between">

                <p className={classNames(
                  "text-green-500 text-sm cursor-pointer",
                  query.filterBy === "for" ? "underline" : ""
                )} onClick={() => {
                  if(query.filterBy === "for") setQuery({filterBy: ""});
                  else setQuery({filterBy: "for"});
                }}>
                  FOR {formatNumber(proposalInfo?.scores[0] || 0)}
                </p>

                <p className={classNames(
                  "text-red-500 text-sm cursor-pointer",
                  query.filterBy === "against" ? "underline" : ""
                )} onClick={() => {
                  if(query.filterBy === "against") setQuery({filterBy: ""});
                  else setQuery({filterBy: "against"});
                }}>
                  AGAINST {formatNumber(proposalInfo?.scores[1] || 0)}
                </p>

              </div>

              <div className='p-3 text-sm text-gray-500'>
                <ColorBar greenScore={proposalInfo?.scores[0] || 0} redScore={proposalInfo?.scores[1] || 0} noTooltip />
              </div>
            </>
          )}

          {!isSimpleVoting && (
            <>
              <div className="flex justify-between">
                <p className="text-green-500 text-sm">VOTES {formatNumber(proposalInfo?.scores_total || 0)}</p>
              </div>

              <div className='p-3 text-sm text-gray-500'>
                <ColorBar greenScore={proposalInfo?.scores_total || 0} redScore={0} noTooltip />
              </div>
            </>
          )}

          <div className="flex justify-between">
            <p className="text-sm">QUORUM {formatNumber(proposalInfo?.quorum || 0)}</p>
            <p className="text-sm">VOTER {formatNumber(proposalInfo?.votes || 0)}</p>
          </div>
        </div>

        <ul role="list" className="space-y-2 pt-2">
          {loading && "loading..."}
          {votes?.map((vote) => (
            <li key={vote.id}>
              <div className={classNames(
                "flex flex-col",
                vote.voter === selectedVoter ? "shadow" : ""
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
                          getColorOfChoice(processChoices(proposalInfo?.type, vote.choice) as string),
                          ''
                        )}>
                          voted {processChoices(proposalInfo?.type, vote.choice) as string}
                        </span>
                      </div>

                      <div>
                        {`${formatNumber(vote.vp)} (${(vote.vp * 100 / (proposalInfo?.scores_total ?? 1)).toFixed()}%)`}
                      </div>

                    </div>
                  )}

                  {!isSimpleVoting && (
                    <div className="text-sm flex flex-col">
                      <div>
                        <FormattedAddress address={vote.voter} style="text-gray-900" noLink={true} />
                      </div>

                      <div className="text-xs text-slate-700 font-semibold">
                        {`${formatNumber(vote.vp)} (${(vote.vp * 100 / (proposalInfo?.scores_total ?? 1)).toFixed()}%)`} total
                      </div>

                      <div className="text-sm text-gray-600 py-2">
                        {(processChoices(proposalInfo?.type, vote.choice) as string[]).map((choice, idx) => (
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

                <VoterProfile space="jbdao.eth" proposal={proposalInfo?.id || ""} voter={vote.voter} isOpen={vote.voter === selectedVoter} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <NewVoteButton proposal={proposalInfo} refetch={refetch} />
    </div>
  );
}
