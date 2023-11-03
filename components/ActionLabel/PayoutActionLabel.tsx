import { payout2JBSplit } from "@/utils/functions/juicebox";
import { Payout } from "@/models/NanceTypes";
import JBSplitEntry from "@/components/JuiceboxCard/JBSplitEntry";

export default function PayoutActionLabel({ payout }: { payout: Payout }) {
  return (
    <span className="line-clamp-5">
      ${payout.amountUSD.toLocaleString()}
      &nbsp;to
      <JBSplitEntry mod={payout2JBSplit(payout)} />
      {/* <FormattedAddress address={(action.payload as Payout).address} style="inline ml-1" /> */}
      {`for ${payout.count} cycles`}
    </span>
  );
}
