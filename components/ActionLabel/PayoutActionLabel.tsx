import { payout2JBSplit } from "@/utils/functions/juicebox";
import { Payout } from "@nance/nance-sdk";
import JBSplitEntry from "@/components/JuiceboxCard/JBSplitEntry";
import { useContext } from "react";
import { ProposalContext } from "../Proposal/context/ProposalContext";
import { dateRangesOfCycles } from "@/utils/functions/GovernanceCycle";
import { SpaceContext } from "@/context/SpaceContext";
import FormattedAddress from "../AddressCard/FormattedAddress";
import { formatNumber } from "@/utils/functions/NumberFormatter";

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

  const total = (payout.count * payout.amountUSD).toLocaleString();

  return (
    <div className="flex flex-col">
      <span className="line-clamp-5">
        ${Number(payout.amountUSD).toLocaleString()}
        &nbsp;to
        <JBSplitEntry mod={payout2JBSplit(payout)} />
        {`for ${payout.count} cycles`} (<span className="font-mono text-sm">{dateRanges}</span>)
      </span>
      <div className="font-semibold italic text-emerald-600">Total Amount: ${total}</div>
    </div>
  );
}
