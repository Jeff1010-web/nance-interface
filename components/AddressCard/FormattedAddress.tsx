import { shortenAddress } from "@/utils/functions/address";
import { Address, useEnsName } from "wagmi";
import { useEffect, useState } from "react";
import { classNames } from "@/utils/functions/tailwind";
import { getAddressLink } from "@/utils/functions/EtherscanURL";
import BasicFormattedCard from "../common/BasicFormattedCard";
import CopyableIcon from "../common/CopyableIcon";

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
   * Network to use for block explorer link. Default is `mainnet`.
   */
  network?: string;
  /**
   * Open the link in a new window. Default is `true`.
   */
  openInNewWindow?: boolean;
  /**
   * Don't render the link and avatar.
   */
  minified?: boolean;

  /**
   * Whether to render as a link.
   */
  link?: boolean;

  /**
   * Whether the address is copyable. Default is `true`.
   */
  copyable?: boolean;

  /**
   * The action to perform when the card is clicked.
   */
  action?: () => void;
}

/**
 * Address will be resolved to ENS name if available.
 * @param address Address to be formatted.
 * @param style Style of the address.
 * @param subText Subtext of the address.
 * @param overrideURLPrefix Override the URL prefix. Default is `https://[goerli.]etherscan.io/address/`.
 * @param network Network to use for block explorer link. Default is `mainnet`.
 * @param openInNewWindow Open the link in a new window. Default is `true`.
 * @param minified Don't render avatar.
 * @param link Whether to render as a link.
 * @param copyable Whether the address is copyable. Default is `true`.
 * @param action The action to perform when the card is clicked.
 */
export default function FormattedAddress({
  address,
  subText,
  style,
  overrideURLPrefix,
  network,
  openInNewWindow = true,
  minified = false,
  link = false,
  copyable = true,
  action,
}: Props) {
  const addr = address as Address;
  const hasAddr = addr && addr.length == 42;
  const anchorTarget = openInNewWindow ? "_blank" : "_self";

  const [label, setLabel] = useState(shortenAddress(address) || "Anon");
  const [hover, setHover] = useState(false);
  const { data: ensName } = useEnsName({ address: addr, enabled: hasAddr, chainId: 1 });

  const _network = network || 'mainnet';
  const urlPrefix = overrideURLPrefix || getAddressLink("", _network);

  useEffect(() => {
    if (ensName) {
      setLabel(ensName);
    } else {
      setLabel(shortenAddress(address) || "Anon");
    }
  }, [ensName, address]);

  if (minified && link) {
    return (
      <a
        target={anchorTarget}
        rel="noopener noreferrer"
        className={classNames(style, "hover:underline")}
        href={`${urlPrefix}${address ? encodeURIComponent(address) : ""}`}
      >
        {label}
      </a>
    );
  }

  if (minified) {
    return (
      <div className="flex flex-row items-center"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <span className={classNames(style)}>{label}</span>
        {copyable && <CopyableIcon text={address || ""} hide={!hover} />}
      </div>
    );
  }

  return (
    <BasicFormattedCard
      imgSrc={`https://cdn.stamp.fyi/avatar/${address}?h=100&w=100`}
      imgAlt={`Avatar of ${label}`}
      action={action}
    >
      <div className="flex flex-row items-center"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <a
          target={anchorTarget}
          rel="noopener noreferrer"
          className={classNames(style, "flex flex-col hover:underline")}
          href={`${urlPrefix}${address ? encodeURIComponent(address) : ""}`}
        >
          <p>{label}</p>
        </a>
        {copyable && <CopyableIcon text={address || ""} hide={!hover} />}
      </div>
      <p className="text-xs text-gray-400">{subText}</p>
    </BasicFormattedCard>
  );
}
