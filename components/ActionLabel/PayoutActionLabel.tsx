import { payout2JBSplit } from "@/utils/functions/juicebox";
import { Payout } from "@nance/nance-sdk";
import JBSplitEntry from "@/components/JuiceboxCard/JBSplitEntry";
import { useContext } from "react";
import { ProposalContext } from "../Proposal/context/ProposalContext";
import { dateRangesOfCycles } from "@/utils/functions/GovernanceCycle";
import { SpaceContext } from "@/context/SpaceContext";

export default function PayoutActionLabel({ payout }: { payout: Payout }) {
  const { commonProps } = useContext(ProposalContext);
  const spaceInfo = useContext(SpaceContext);

  const cycle = commonProps.governanceCycle || 0;
  const cycleStartDate = spaceInfo?.cycleStartDate;
  const length = payout.count;
  const dateRanges = dateRangesOfCycles({
    cycle,
    length,
    currentCycle: spaceInfo?.currentCycle,
    cycleStartDate: cycleStartDate as string,
  });

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
