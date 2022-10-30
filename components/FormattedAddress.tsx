import { shortenAddress } from "../libs/address";
import { Address, useEnsName } from "wagmi";

export interface Props {
    address: string;
    style?: string;
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function FormattedAddress({ address, style }: Props) {
    const addr = address as Address;
    const { data: ensName } = useEnsName({ address: addr })

    return (
        <a target="_blank" rel="noopener noreferrer"
            className={classNames(
                style,
                'hover:underline'
            )} href={`https://etherscan.io/address/${encodeURIComponent(address)}`}>
            {ensName || shortenAddress(address)}
        </a>
    )
}