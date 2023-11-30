import { shortenAddress } from "@/utils/functions/address";
import { Address, useEnsName } from "wagmi";
import { useContext, useEffect, useState } from "react";
import { classNames } from "@/utils/functions/tailwind";
import { getAddressLink } from "@/utils/functions/EtherscanURL";
import { NetworkContext } from "@/context/NetworkContext";
import CopyableTooltip from "../common/CopyableTooltip";
import BasicFormattedCard from "../common/BasicFormattedCard";

interface Props {
  /**
   * Address to be formatted.
   */
  address: string | undefined;
  /**
   * Subtext of the address.
   */
  subText?: string;
  /**
   * Style of the address.
   */
  style?: string;
  /**
   * Override the URL prefix. Default is `https://[goerli.]etherscan.io/address/`.
   */
  overrideURLPrefix?: string;
  /**
   * Open the link in a new window. Default is `true`.
   */
  openInNewWindow?: boolean;
  /**
   * Don't render the link and avatar.
   */
  minified?: boolean;
}

/**
 * Address will be resolved to ENS name if available.
 * @param address Address to be formatted.
 * @param style Style of the address.
 * @param subText Subtext of the address.
 * @param overrideURLPrefix Override the URL prefix. Default is `https://[goerli.]etherscan.io/address/`.
 * @param openInNewWindow Open the link in a new window. Default is `true`.
 * @param minified Don't render the link and avatar.
 */
export default function FormattedAddress({
  address,
  subText,
  style,
  overrideURLPrefix,
  openInNewWindow = true,
  minified = false,
}: Props) {
  const addr = address as Address;
  const hasAddr = addr && addr.length == 42;
  const anchorTarget = openInNewWindow ? "_blank" : "_self";

  const [label, setLabel] = useState(shortenAddress(address) || "Anon");
  const { data: ensName } = useEnsName({ address: addr, enabled: hasAddr, chainId: 1 });

  const network = useContext(NetworkContext);
  const urlPrefix = overrideURLPrefix || getAddressLink("", network);

  useEffect(() => {
    if (ensName) {
      setLabel(ensName);
    } else {
      setLabel(shortenAddress(address) || "Anon");
    }
  }, [ensName, address]);

  if (minified) {
    return (
      <CopyableTooltip text={address || ""}>
        <span className={classNames(style)}>{label}</span>
      </CopyableTooltip>
    );
  }

  return (
    <CopyableTooltip text={address || ""}>
      <BasicFormattedCard
        imgSrc={`https://cdn.stamp.fyi/avatar/${address}?h=100&w=100`}
        imgAlt={`Avatar of ${label}`}
      >
        <a
          target={anchorTarget}
          rel="noopener noreferrer"
          className={classNames(style, "flex flex-col hover:underline")}
          href={`${urlPrefix}${address ? encodeURIComponent(address) : ""}`}
        >
          <p>{label}</p>
          <p className="text-xs text-gray-400">{subText}</p>
        </a>
      </BasicFormattedCard>
    </CopyableTooltip>
  );
}
