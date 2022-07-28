import { shortenAddress } from "../libs/address";
import { useEnsName } from "wagmi";

export default function FormattedAddress({ address }) {
    const { data: ensName } = useEnsName({ address })

    return (
        <span className="text-sm">
            {ensName || shortenAddress(address)}
        </span>
    )
}