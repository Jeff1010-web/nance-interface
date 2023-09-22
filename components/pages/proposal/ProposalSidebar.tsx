import { Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useQueryParams, withDefault, NumberParam, createEnumParam } from "next-query-params";
import Link from "next/link";
import { Fragment, useContext, useState } from "react";
import { NANCE_DEFAULT_SPACE } from "../../../constants/Nance";
import { canEditProposal } from "../../../libs/nance";
import { classNames } from "../../../libs/tailwind";
import ColorBar from "../../ColorBar";
import { SnapshotProposal } from "../../../hooks/snapshot/Proposals";
import Notification from "../../Notification";
import { Proposal, ProposalDeleteRequest, ProposalUploadRequest } from "../../../models/NanceTypes";
import { useProposalUpload, useProposalDelete } from "../../../hooks/NanceHooks";
import { openInDiscord } from "../../../libs/discord";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import ProposalVotes from "./ProposalVotes";
import { ProposalContext } from "../../../pages/s/[space]/[proposal]";

const ProposalStatus = [
  {title: "Archive", description: "Archive your proposal and exit from governance process."},
  {title: "Delete", description: "Delete your proposal and this can't be undo."},
];

export default function ProposalSidebar(
  { space, proposal, snapshotProposal }:
  { space: string, proposal: Proposal | undefined, snapshotProposal: SnapshotProposal | undefined }
) {

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
  
  const [nanceAPILoading, setNanceAPILoading] = useState(false);
  const { data: session, status } = useSession();
  const [selected, setSelected] = useState(ProposalStatus[0]);
  const { commonProps } = useContext(ProposalContext);

  const { isMutating, error: uploadError, trigger, data, reset } = useProposalUpload(space, proposal?.hash, router.isReady);
  const { trigger: deleteTrigger, reset: deleteReset, error: deleteError } = useProposalDelete(space, proposal?.hash, router.isReady);
  const error = uploadError || deleteError;

  const archiveProposal = async () => {
    setNanceAPILoading(true);
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
      }).finally(() => {
        setNanceAPILoading(false);
      });
  };

  const deleteProposal = async () => {
    setNanceAPILoading(true);
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
        }).finally(() => {
          setNanceAPILoading(false);
        });
    }
  };

  const unarchiveProposal = async () => {
    setNanceAPILoading(true);
    const payload: any = {
      ...proposal,
      status: "Discussion"
    };
    console.debug("📚 Nance.UNarchiveProposal.onSubmit ->", { payload });

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
      }).finally(() => {
        setNanceAPILoading(false);
      });
  };
  
  return (
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

          {proposal?.status === "Temperature Check" && (
            <>
              <p>Temp check voting open on Discord now.</p>

              <a href={openInDiscord(proposal.discussionThreadURL) || '#'} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full">
                Vote on Discord
              </a>
            </>
          )}
          
          {canEditProposal(proposal?.status) && status === "authenticated" && (
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

          {canEditProposal(proposal?.status) && status === "authenticated" && proposal?.status !== "Archived" && (
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
                      }} className={classNames(
                        "inline-flex items-center justify-center rounded-none rounded-l-md border border-transparent px-4 py-2 text-sm font-medium disabled:text-black text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full",
                        (selected.title === "Delete" ? "bg-red-600 hover:bg-red-500" : "bg-gray-600 hover:bg-gray-500")
                      )}
                      disabled={nanceAPILoading}
                      >
                        {nanceAPILoading && (
                          <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-gray-900 rounded-full mr-2" role="status" aria-label="loading">
                          </div>
                        )}
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
                                active ? (option.title === "Delete" ? 'bg-red-600 text-white' : 'bg-gray-600 text-white') : 'text-gray-900',
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

          {proposal?.status === "Archived" && status === "authenticated" && (
            <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full"
              onClick={() => unarchiveProposal()}
              disabled={nanceAPILoading}
            >
              {nanceAPILoading && (
                <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-gray-900 rounded-full mr-2" role="status" aria-label="loading">
                </div>
              )}
              Unarchive Proposal
            </button>
          )}
          {proposal?.status === "Cancelled" && (
            <>
              <p>Temp check failed, this proposal has been cancelled.</p>

              <a href={openInDiscord(proposal.discussionThreadURL) || '#'} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full">
                Check discussion on Discord
              </a>
            </>
          )}

          {proposal?.status === "Revoked" && (
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
        <ProposalVotes snapshotSpace={commonProps.snapshotSpace} />
      )}
    </div>
  );
}