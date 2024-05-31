import {
  useQueryParams,
  withDefault,
  NumberParam,
  createEnumParam,
} from "next-query-params";
import { useContext } from "react";
import ColorBar from "@/components/common/ColorBar";
import { SnapshotProposal } from "@/models/SnapshotTypes";
import type { Proposal } from "@nance/nance-sdk";
import { useRouter } from "next/router";
import ProposalVotes from "./ProposalVotes";
import { ProposalContext } from "./context/ProposalContext";

export default function ProposalSidebar({
  proposal,
  snapshotProposal,
}: {
  proposal: Proposal | undefined;
  snapshotProposal: SnapshotProposal | undefined;
}) {
  const router = useRouter();
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    withField: withDefault(createEnumParam(["reason", "app"]), ""),
    filterBy: withDefault(createEnumParam(["for", "against"]), ""),
  });

  const { commonProps } = useContext(ProposalContext);

  return (
    <div
      className="lg:mt-5 sticky bottom-6 top-6 bg-white px-4 py-5 opacity-100 shadow sm:rounded-lg sm:px-6"
      style={{
        maxHeight: "calc(100vh - 1rem)",
      }}
    >
      <button
        onClick={() => {
          if (query.sortBy === "time") {
            setQuery({ sortBy: "vp" });
          } else {
            setQuery({ sortBy: "time" });
          }
        }}
        className="text-lg font-medium"
      >
        Votes
        <span className="ml-2 text-center text-xs text-gray-300">
          sort by {query.sortBy === "vp" ? "voting power" : "time"}
        </span>
      </button>

      {!snapshotProposal && (
        <div className="mt-2 space-y-4">
          <ColorBar
            greenScore={proposal?.temperatureCheckVotes?.[0] || 0}
            redScore={proposal?.temperatureCheckVotes?.[1] || 0}
            threshold={10}
          />
        </div>
      )}

      {snapshotProposal && (
        <ProposalVotes snapshotSpace={commonProps.snapshotSpace} />
      )}
    </div>
  );
}
