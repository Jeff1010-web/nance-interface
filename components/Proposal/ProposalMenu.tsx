import { useContext, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Menu } from "@headlessui/react";
import {
  ShareIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  ChevronDownIcon,
  TrashIcon,
  ArchiveBoxArrowDownIcon,
  ArrowUpOnSquareStackIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import ResultModal from "../modal/ResultModal";
import { ProposalContext } from "./context/ProposalContext";
import { useProposalDelete, useProposalUpload } from "@/utils/hooks/NanceHooks";
import { Proposal } from "@nance/nance-sdk";


export default function ProposalMenu() {
  const proposalContext = useContext(ProposalContext);
  const { commonProps } = proposalContext;
  const { uuid, proposalId, space } = commonProps;
  const router = useRouter();
  
  // hooks
  const { trigger: deleteTrigger } = useProposalDelete(space, uuid);
  const { trigger: uploadTrigger } = useProposalUpload(space, uuid);
  const { status: walletStatus } = useSession();

  // state
  const [deleteConfirmModalIsOpen, setDeleteConfirmModalIsOpen] = useState(false);
  const [archiveConfirmModalIsOpen, setArchiveConfirmModalIsOpen] = useState(false);

  const status = proposalContext.commonProps.status;
  const showVariableActions = walletStatus === "authenticated" && (
    status === "Archived" || status === "Draft" || status === "Discussion" || status === "Temperature Check"
  );

  const handleUnarchive = () => {
    const proposal = { uuid, status: "Discussion" } as unknown as Proposal;
    uploadTrigger({ proposal }).then(() => {
      toast.success("Proposal unarchived successfully");
      router.reload();
    }).catch((e) => {
      toast.error(`Failed to unarchive proposal: ${e}`);
    });
  };

  return (
    <>
      {/* Delete Modal */}
      <ResultModal
        title="Are you sure you want to delete this proposal?"
        description="You can't undo this action."
        buttonText="Delete it"
        onClick={() => {
          setDeleteConfirmModalIsOpen(false);
          deleteTrigger().then(() => {
            toast.success("Proposal deleted successfully");
            router.push(`/s/${space}`);
          }).catch((e) => {
            toast.error(`Failed to delete proposal: ${e}`);
          });
        }}
        close={() => setDeleteConfirmModalIsOpen(false)}
        shouldOpen={deleteConfirmModalIsOpen}
      />

      {/* Archive Modal */}
      <ResultModal
        title="Are you sure you want to archive this proposal?"
        description="You can always unarchive it later."
        buttonText="Archive it"
        onClick={() => {
          setArchiveConfirmModalIsOpen(false);
          const proposal = { uuid, status: "Archived" } as unknown as Proposal;
          uploadTrigger({ proposal }).then(() => {
            toast.success("Proposal archived successfully");
            router.push(`/s/${space}`);
          }).catch((e) => {
            toast.error(`Failed to archive proposal: ${e}`);
          });
        }}
        close={() => setArchiveConfirmModalIsOpen(false)}
        shouldOpen={archiveConfirmModalIsOpen}
      />

      <Menu as="div" className="relative inline-block">
        <div>
          <Menu.Button className="inline-flex w-full justify-end rounded-md sm:hidden">
            <EllipsisVerticalIcon
              className="h-7 w-7 text-indigo-600 hover:text-gray-900"
              aria-hidden="true"
            />
          </Menu.Button>

          <Menu.Button className="hidden w-full justify-center gap-x-1.5 rounded-md bg-gray px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:inline-flex">
            Options
            <ChevronDownIcon
              className="-mr-1 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-violet-500 text-white" : "text-gray-900"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                >
                  <ShareIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                    Copy Link
                </button>
              )}
            </Menu.Item>
          </div>
          {showVariableActions && (
            <>
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      className={`${
                        active ? "bg-green-500 text-white" : "text-gray-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      href={`/s/${space}/edit?&proposalId=${proposalId || uuid}&fork=true`}
                    >
                      <ArrowUpOnSquareStackIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                      Fork
                    </Link>
                  )}
                </Menu.Item>
              </div>
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      className={`${
                        active ? "bg-blue-500 text-white" : "text-gray-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      href={`/s/${space}/edit?&proposalId=${proposalId || uuid}`}
                    >
                      <PencilIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                      Edit
                    </Link>
                  )}
                </Menu.Item>
              </div>
              <div className="px-1 py-1">
                {status === "Archived" ? (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-emerald-500 text-white" : "text-gray-900"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        onClick={() => {
                          handleUnarchive();
                        }}
                      >
                        <DocumentTextIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      Unarchive
                      </button>
                    )}
                  </Menu.Item>
                ) : (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-amber-400 text-white" : "text-gray-900"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        onClick={() => {
                          setArchiveConfirmModalIsOpen(true);
                        }}
                      >
                        <ArchiveBoxArrowDownIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                        Archive
                      </button>
                    )}
                  </Menu.Item>
                )}
              </div>
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? "bg-red-400 text-white" : "text-gray-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      onClick={() => {
                        setDeleteConfirmModalIsOpen(true);
                      }}
                    >
                      <TrashIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                      Delete
                    </button>
                  )}
                </Menu.Item>
              </div>
            </>
          )}
        </Menu.Items>
      </Menu>
    </>
  );
}