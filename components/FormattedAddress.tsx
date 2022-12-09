import { shortenAddress } from "../libs/address";
import { Address, useEnsName } from "wagmi";
import { useEffect, useState } from "react";

export interface Props {
    address: string;
    style?: string;
    overrideURLPrefix?: string;
    openInNewWindow?: boolean;
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function FormattedAddress({ address, style, overrideURLPrefix, openInNewWindow = true }: Props) {
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

    return (
        <a target={anchorTarget} rel="noopener noreferrer"
            className={classNames(
                style,
                'hover:underline'
            )} href={`${urlPrefix}${encodeURIComponent(address)}`}>
            {label}
        </a>
    )
}