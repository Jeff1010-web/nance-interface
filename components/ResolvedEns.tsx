import { Tooltip } from "flowbite-react";
import { useEnsAddress } from "wagmi";
import { shortenAddress } from "../libs/address";

export interface Props {
    ens: string;
    style?: string;
    hook?: (address: string) => void;
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function ResolvedEns({ ens, style, hook }: Props) {
    const { data: address, isError, isLoading } = useEnsAddress({
        name: ens,
        enabled: ens.endsWith('.eth')
    })

    if(isLoading) {
        return (
            <p className={classNames(
                "mt-2 text-xs text-gray-500",
                style
            )}>
                Loading...
            </p>
        )
    }

    if(hook) {
        hook(ens.endsWith('.eth') ? address : ens);
    }

    if(ens.endsWith('.eth')) {
        if(isError || !address) {
            return (
                <p className={classNames(
                    "mt-2 text-xs text-red-500",
                    style
                )}>
                    Can&apos;t resolve {ens}
                </p>
            )
        } else {
            return (
                <Tooltip content={address}>
                    <a target="_blank" rel="noopener noreferrer"
                        className={classNames(
                            "text-xs text-gray-500 hover:underline truncate",
                            style,
                        )} href={`https://etherscan.io/address/${encodeURIComponent(address)}`}>
                        Resolved to {shortenAddress(address)}
                    </a>
                </Tooltip>
            )
        }
    }
}