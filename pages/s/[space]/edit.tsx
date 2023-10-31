import SiteNav from "../../../components/SiteNav";
import { useQueryParams, StringParam } from "next-query-params";
import React from "react";
import { useRouter } from "next/router";
import { Proposal } from "../../../models/NanceTypes";
import { NANCE_API_URL } from "../../../constants/Nance";
import Footer from "../../../components/Footer";
import { getToken } from "next-auth/jwt";
import ProposalEditForm from "../../../components/pages/edit/ProposalEditForm";

export const ProposalMetadataContext = React.createContext({
  loadedProposal: null as Proposal | null,
  fork: false as boolean,
  space: '' as string
});

export async function getServerSideProps({ req, query, params}: any) {
  // check proposal parameter type
  const proposalParam: string = query.proposalId;
  const spaceParam: string = params.space;
  const forkParam: string = query.fork;

  // Attach the JWT token to the request headers
  const token = await getToken({ req, raw: true });
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  let proposalResponse = null;
  if (proposalParam) {
    proposalResponse = await fetch(`${NANCE_API_URL}/${spaceParam}/proposal/${proposalParam}`, {headers}).then(res => res.json());
  }

  // Pass data to the page via props
  return { props: { space: spaceParam, loadedProposal: proposalResponse?.data || null, fork: forkParam === "true" } };
}

export default function NanceEditProposal({ space, loadedProposal, fork }: { space: string, loadedProposal: Proposal, fork: boolean }) {
  const router = useRouter();

  const [query, setQuery] = useQueryParams({
    proposalId: StringParam
  });
  const { proposalId } = query;

  if (!router.isReady) {
    return <p className="mt-2 text-xs text-gray-500 text-center">loading...</p>;
  }

  return (
    <>
      <SiteNav
        pageTitle="Edit Proposal"
        description="Create or edit proposal on Nance."
        space={space}
        withWallet />
        
      <div className="m-4 lg:m-6 flex justify-center items-center">
        <div className="max-w-7xl w-full">
          <p className="text-2xl font-bold">
            {(proposalId && !fork) ? "Edit" : "New"} Proposal for {space}
          </p>

          <ProposalMetadataContext.Provider value={{ loadedProposal, fork, space }}>
            <ProposalEditForm space={space} />
          </ProposalMetadataContext.Provider>
        </div>
      </div>

      <Footer />
    </>
  );
}
