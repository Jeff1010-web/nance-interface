import { shortenAddress } from "../libs/address";
import { useEnsName } from "wagmi";

export interface Props {
    address: string;
}

export default function FormattedAddress({ address }: Props) {
    const { data: ensName } = useEnsName({ address })

    return (
        <a target="_blank" rel="noopener noreferrer" className="hover:underline" href={`https://etherscan.io/address/${encodeURIComponent(address)}`}>
            {ensName || shortenAddress(address)}
        </a>
    )
}