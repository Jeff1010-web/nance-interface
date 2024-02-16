import { payout2JBSplit } from "@/utils/functions/juicebox";
import { Payout } from "@/models/NanceTypes";
import JBSplitEntry from "@/components/JuiceboxCard/JBSplitEntry";
import { useContext } from "react";
import { ProposalContext } from "../Proposal/context/ProposalContext";
import { dateRangesOfCycles } from "@/utils/functions/GovernanceCycle";

export default function PayoutActionLabel({ payout }: { payout: Payout }) {
  const { commonProps } = useContext(ProposalContext);

  const cycle = commonProps.governanceCycle || 0;
  const length = payout.count;
  const dateRanges = dateRangesOfCycles(cycle, length);

  return (
    <span className="line-clamp-5">
      ${payout.amountUSD.toLocaleString()}
      &nbsp;to
      <JBSplitEntry mod={payout2JBSplit(payout)} />
      {/* <FormattedAddress address={(action.payload as Payout).address} style="inline ml-1" /> */}
      {`for ${payout.count} cycles (${dateRanges})`}
    </span>
  );
}
