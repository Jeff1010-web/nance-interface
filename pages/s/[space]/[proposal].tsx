import { useEffect, useState } from "react";
import { useProposalsByID } from "@/utils/hooks/snapshot/Proposals";
import { canEditProposal, getLastSlash } from "@/utils/functions/nance";
import { Proposal } from "@/models/NanceTypes";
import Custom404 from "../../404";
import { ScrollToBottom } from "@/components/PageButton";
import { NANCE_API_URL } from "@/constants/Nance";
import { getToken } from "next-auth/jwt";
import ProposalSidebar from "@/components/Proposal/ProposalSidebar";
import ProposalContent from "@/components/Proposal/ProposalContent";
import ProposalOptions from "@/components/Proposal/ProposalOptions";
import ProposalLoading from "@/components/Proposal/ProposalLoading";
import { getFirstParagraphOfMarkdown } from "@/utils/functions/markdown";
import { useSpaceInfo } from "@/utils/hooks/NanceHooks";
import { ZERO_ADDRESS } from "@/constants/Contract";
import { Footer, SiteNav } from "@/components/Site";
import {
  ProposalCommonProps,
  ProposalContext,
} from "@/components/Proposal/context/ProposalContext";

export async function getServerSideProps({ req, params, res }: any) {
  let proposal: Proposal;

  // check proposal parameter type
  const proposalParam: string = params.proposal;
  const spaceParam: string = params.space;

  // Attach the JWT token to the request headers
  const token = await getToken({ req, raw: true });
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const proposalResponse = await fetch(
    `${NANCE_API_URL}/${spaceParam}/proposal/${proposalParam}`,
    { headers },
  ).then((res) => res.json());
  proposal = proposalResponse.data;

  if (!canEditProposal(proposal.status))
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=59",
    );

  // Pass data to the page via props
  return {
    props: {
      space: spaceParam,
      proposal: proposal || null,
    },
  };
}

export default function NanceProposalPage({
  space,
  proposal,
}: {
  space: string;
  proposal: Proposal | undefined;
}) {
  // state
  const [loading, setLoading] = useState<boolean>(true);

  const proposalHash = getLastSlash(proposal?.voteURL);

  const { data: spaceInfo } = useSpaceInfo({ space });
  const {
    data: { proposalsData },
  } = useProposalsByID([proposalHash], "", proposalHash === undefined);

  const snapshotProposal = proposalsData?.[0];
  const snapshotSpace = spaceInfo?.data?.snapshotSpace;

  useEffect(() => {
    if (spaceInfo && proposalsData) {
      setLoading(false);
    }
  }, [spaceInfo, proposalsData]);

  // this page need proposal to work
  if (!proposal) {
    return (
      <Custom404 errMsg="Proposal not found on Nance platform, you can reach out in Discord or explore on the home page." />
    );
  }

  const commonProps: ProposalCommonProps = {
    space,
    snapshotSpace: snapshotSpace || "",
    status: snapshotProposal?.state || proposal.status,
    title: snapshotProposal?.title || proposal.title,
    author: proposal.authorAddress || snapshotProposal?.author || "",
    coauthors: proposal.coauthors || [],
    body: snapshotProposal?.body || proposal.body || "",
    created:
      snapshotProposal?.start ||
      (proposal.date
        ? Math.floor(new Date(proposal.date).getTime() / 1000)
        : 0),
    end: snapshotProposal?.end || 0,
    snapshot: snapshotProposal?.snapshot || "",
    snapshotHash: proposal.voteURL || "",
    ipfs: snapshotProposal?.ipfs || proposal.ipfsURL || "",
    discussion: proposal.discussionThreadURL || "",
    governanceCycle: proposal.governanceCycle || 0,
    uuid: proposal.hash || "",
    actions: proposal.actions,
    proposalId: proposal.proposalId || 0,
  };

  return (
    <>
      <SiteNav
        pageTitle={`${proposal.title} | ${space}`}
        description={
          getFirstParagraphOfMarkdown(commonProps.body) || "No content"
        }
        image={`https://cdn.stamp.fyi/avatar/${
          commonProps.author || ZERO_ADDRESS
        }?w=1200&h=630`}
        space={space}
        proposalId={proposal?.hash}
        withWallet
        withSiteSuffixInTitle={false}
      />

      {loading ? (
        <ProposalLoading />
      ) : (
        <div className="min-h-full">
          <main className="py-2">
            <ProposalContext.Provider
              value={{
                commonProps,
                proposalInfo: snapshotProposal || undefined,
              }}
            >
              <div className="mx-auto mt-4 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2 lg:col-start-1">
                  {/* Content */}
                  <section aria-labelledby="proposal-title">
                    <ProposalContent body={commonProps.body} />
                  </section>

                  {/* Display Options if not basic (For Against) */}
                  <section aria-labelledby="options-title">
                    {snapshotProposal &&
                      [
                        "approval",
                        "ranked-choice",
                        "quadratic",
                        "weighted",
                      ].includes(snapshotProposal.type) && (
                        <div className="mt-6 flow-root">
                          <ProposalOptions proposal={snapshotProposal} />
                        </div>
                      )}
                  </section>
                </div>

                <section
                  aria-labelledby="stats-title"
                  className="lg:col-span-1 lg:col-start-3"
                >
                  <ProposalSidebar
                    space={space}
                    proposal={proposal}
                    snapshotProposal={snapshotProposal}
                  />
                </section>
              </div>

              <ScrollToBottom />
            </ProposalContext.Provider>
          </main>
        </div>
      )}
      <Footer />
    </>
  );
}
