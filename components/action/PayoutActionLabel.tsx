import { payout2JBSplit } from "../../libs/juicebox";
import { Payout } from "../../models/NanceTypes";
import JBSplitEntry from "../juicebox/JBSplitEntry";

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