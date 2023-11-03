import { Address } from "wagmi";
import { useContext, useEffect, useState } from "react";
import { useEtherscanContract } from "@/utils/hooks/EtherscanHooks";
import { classNames } from "@/utils/functions/tailwind";
import { getAddressLink } from "@/utils/functions/EtherscanURL";
import { NetworkContext } from "@/context/NetworkContext";

interface Props {
  address: string;
  style?: string;
  overrideURLPrefix?: string;
  openInNewWindow?: boolean;
  noLink?: boolean;
}

export default function ResolvedContract({
  address,
  style,
  overrideURLPrefix,
  openInNewWindow = true,
  noLink = false,
}: Props) {
  const addr = address as Address;
  const hasAddr = addr && addr.length == 42;
  const anchorTarget = openInNewWindow ? "_blank" : "_self";

  const [label, setLabel] = useState<string>(address);
  const { data: contractSources } = useEtherscanContract(addr, hasAddr);

  const network = useContext(NetworkContext);
  const urlPrefix = overrideURLPrefix || getAddressLink("", network);

  useEffect(() => {
    if (contractSources?.[0]) {
      setLabel(contractSources[0].ContractName);
    }
  }, [contractSources]);

  if (noLink) {
    return <span className={style}>{label}</span>;
  }

  return (
    <a
      target={anchorTarget}
      rel="noopener noreferrer"
      className={classNames(style, "hover:underline")}
      href={`${urlPrefix}${encodeURIComponent(address)}`}
    >
      {label}
    </a>
  );
}
