import { numToPrettyString } from "@/utils/functions/NumberFormatter";
import { Transfer } from "@nance/nance-sdk";
import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import { useToken } from "wagmi";
import { getChainById } from "config/custom-chains";

export default function TransferActionLabel({
  transfer,
}: {
  transfer: Transfer;
}) {

  const { data } = useToken({
    address: transfer.contract as `0x${string}`,
    chainId: transfer.chainId,
  });

  const chain = getChainById(transfer.chainId);
  const explorer = `${chain.blockExplorers?.etherscan?.url}/token/${transfer.contract}`;

  return (
    <span className="line-clamp-5">
      {numToPrettyString(Number(transfer.amount))}
      &nbsp;<a href={explorer} target="_blank" rel="noreferrer">${data?.symbol}</a>
      &nbsp;to
      <div className="mx-1 inline-block">
        <FormattedAddress address={transfer.to} style="inline ml-1" minified copyable />
      </div>
    </span>
  );
}
