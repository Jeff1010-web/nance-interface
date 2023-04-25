import { Address } from "wagmi";
import { useEffect, useState } from "react";
import { useEtherscanContract } from "../hooks/EtherscanHooks";

export interface Props {
    address: string;
    style?: string;
    overrideURLPrefix?: string;
    openInNewWindow?: boolean;
    noLink?: boolean;
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function ResolvedContract({ address, style, overrideURLPrefix, openInNewWindow = true, noLink = false }: Props) {
    const addr = address as Address;
    const hasAddr = addr && addr.length == 42;
    const urlPrefix = overrideURLPrefix || "https://etherscan.io/address/";
    const anchorTarget = openInNewWindow ? "_blank" : "_self";

    const [label, setLabel] = useState<string>(address);
    const { data: contractSources } = useEtherscanContract(addr, hasAddr);

    useEffect(() => {
        if (contractSources?.[0]) {
            setLabel(contractSources[0].ContractName);
        }
    }, [contractSources]);

    if(noLink) {
        return (
            <span className={style}>
                {label}
            </span>
        )
    }

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