import { shortenAddress } from "../libs/address";
import { Address, useEnsName } from "wagmi";
import { useEffect, useState } from "react";

export interface Props {
    address: string;
    style?: string;
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function FormattedAddress({ address, style }: Props) {
    const addr = address as Address;
    const hasAddr = addr && addr.length == 42;

    const [label, setLabel] = useState(shortenAddress(address) || "Anon");
    const { data: ensName } = useEnsName({ address: addr, enabled: hasAddr });

    useEffect(() => {
        if (ensName) {
            setLabel(ensName);
        }
    }, [ensName]);

    return (
        <a target="_blank" rel="noopener noreferrer"
            className={classNames(
                style,
                'hover:underline'
            )} href={`https://etherscan.io/address/${encodeURIComponent(address)}`}>
            {label}
        </a>
    )
}