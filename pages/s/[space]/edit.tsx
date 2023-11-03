import { useQueryParams, StringParam } from "next-query-params";
import React from "react";
import { useRouter } from "next/router";
import { Proposal } from "@/models/NanceTypes";
import { NANCE_API_URL } from "@/constants/Nance";
import { getToken } from "next-auth/jwt";
import { Footer, SiteNav } from "@/components/Site";
import { ProposalMetadataContext } from "@/components/ProposalEdit/context/ProposalMetadataContext";
import ProposalEditForm from "@/components/ProposalEdit/ProposalEditForm";

export async function getServerSideProps({ req, query, params }: any) {
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
    proposalResponse = await fetch(
      `${NANCE_API_URL}/${spaceParam}/proposal/${proposalParam}`,
      { headers },
    ).then((res) => res.json());
  }

  // Pass data to the page via props
  return {
    props: {
      space: spaceParam,
      loadedProposal: proposalResponse?.data || null,
      fork: forkParam === "true",
    },
  };
}

export default function NanceEditProposal({
  space,
  loadedProposal,
  fork,
}: {
  space: string;
  loadedProposal: Proposal;
  fork: boolean;
}) {
  const router = useRouter();

  const [query, setQuery] = useQueryParams({
    proposalId: StringParam,
  });
  const { proposalId } = query;

  if (!router.isReady) {
    return <p className="mt-2 text-center text-xs text-gray-500">loading...</p>;
  }

  return (
    <>
      <SiteNav
        pageTitle="Edit Proposal"
        description="Create or edit proposal on Nance."
        space={space}
        withWallet
      />

      <div className="m-4 flex items-center justify-center lg:m-6">
        <div className="w-full max-w-7xl">
          <p className="text-2xl font-bold">
            {proposalId && !fork ? "Edit" : "New"} Proposal for {space}
          </p>

          <ProposalMetadataContext.Provider
            value={{ loadedProposal, fork, space }}
          >
            <ProposalEditForm space={space} />
          </ProposalMetadataContext.Provider>
        </div>
      </div>

      <Footer />
    </>
  );
}
