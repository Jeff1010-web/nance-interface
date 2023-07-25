import { shortenAddress } from "../libs/address";
import { Address, useEnsName } from "wagmi";
import { useEffect, useState } from "react";
import { classNames } from '../libs/tailwind';

export interface Props {
    address: string | undefined;
    style?: string;
    overrideURLPrefix?: string;
    openInNewWindow?: boolean;
    noLink?: boolean;
}

export default function FormattedAddress({ address, style, overrideURLPrefix, openInNewWindow = true, noLink = false }: Props) {
  const addr = address as Address;
  const hasAddr = addr && addr.length == 42;
  const urlPrefix = overrideURLPrefix || "https://etherscan.io/address/";
  const anchorTarget = openInNewWindow ? "_blank" : "_self";

  const [label, setLabel] = useState(shortenAddress(address) || "Anon");
  const { data: ensName } = useEnsName({ address: addr, enabled: hasAddr });

  useEffect(() => {
    if (ensName) {
      setLabel(ensName);
    } else {
      setLabel(shortenAddress(address) || "Anon");
    }
  }, [ensName, address]);

  if(noLink) {
    return (
      <span className={style}>
        {label}
      </span>
    );
  }

  return (
    <a target={anchorTarget} rel="noopener noreferrer"
      className={classNames(
        style,
        'hover:underline'
      )} href={`${urlPrefix}${address ? encodeURIComponent(address) : ''}`}>
      {label}
    </a>
  );
}