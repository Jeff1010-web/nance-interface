import { useQueryParams, StringParam } from "next-query-params";
import Link from "next/link";
import { Footer, SiteNav } from "@/components/Site";
import { ProposalMetadataContext } from "@/components/ProposalEdit/context/ProposalMetadataContext";
import ProposalEditForm from "@/components/ProposalEdit/ProposalEditForm";
import { useProposal, useSpaceInfo } from "@/utils/hooks/NanceHooks";
import { SpaceContext } from "@/context/SpaceContext";
import { useParams } from "next/navigation";

export default function NanceEditProposal(){
  const params = useParams<{ space: string }>();
  const space = params?.space;
  const [{ proposalId, fork: forkString }] = useQueryParams({ proposalId: StringParam, fork: StringParam});
  const args = { space, uuid: proposalId || "" };
  const shouldFetch = !!proposalId && !!space;
  const { data, isLoading: proposalLoading } = useProposal(args, shouldFetch);
  const loadedProposal = data?.data;
  const fork = forkString === "true";

  const { data: spaceInfoResponse } = useSpaceInfo({ space });
  const spaceInfo = spaceInfoResponse?.data;

  if (proposalLoading || !spaceInfo) {
    return (
      <>
        <SiteNav pageTitle="Edit Proposal" description="Create or edit proposal on Nance." space={space} withWallet withProposalButton={false} />
        <div className="m-4 flex items-center justify-center lg:m-6">
          <div className="w-full max-w-7xl">
            <p>Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SiteNav
        pageTitle="Edit Proposal"
        description="Create or edit proposal on Nance."
        space={space}
        withWallet
        withProposalButton={false}
      />

      <div className="m-4 flex items-center justify-center lg:m-6">
        <div className="w-full max-w-7xl">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">
              {proposalId && !fork ? "Edit" : "New"} Proposal for {space}
            </p>
            <div className="flex items-center">
              <Link href={`/s/${space}`} legacyBehavior>
                <a className="ml-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  Cancel
                </a>
              </Link>
            </div>
          </div>
          <ProposalMetadataContext.Provider
            value={{ loadedProposal, fork, space }}
          >
            <SpaceContext.Provider value={spaceInfo}>
              <ProposalEditForm space={space} />
            </SpaceContext.Provider>
          </ProposalMetadataContext.Provider>
        </div>
      </div>

      <Footer />
    </>
  );
}
