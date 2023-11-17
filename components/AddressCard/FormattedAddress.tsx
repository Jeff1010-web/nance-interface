import { shortenAddress } from "@/utils/functions/address";
import { Address, useEnsName } from "wagmi";
import { useContext, useEffect, useState } from "react";
import { classNames } from "@/utils/functions/tailwind";
import { getAddressLink } from "@/utils/functions/EtherscanURL";
import { NetworkContext } from "@/context/NetworkContext";

interface Props {
  address: string | undefined;
  style?: string;
  overrideURLPrefix?: string;
  openInNewWindow?: boolean;
  noLink?: boolean;
}

export default function FormattedAddress({
  address,
  style,
  overrideURLPrefix,
  openInNewWindow = true,
  noLink = false,
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

  if (noLink) {
    return <span className={style}>{label}</span>;
  }

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
