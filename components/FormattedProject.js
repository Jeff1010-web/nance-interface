import { useContractRead } from 'wagmi';
import { parseBytes32String } from '@ethersproject/strings'
import { ProjectsContract } from "../libs/contractsV1";
import Link from "next/link";

export default function FormattedProject({projectId}) {
    const { data: rawHandle, isLoading } = useContractRead({
        ...ProjectsContract,
        functionName: 'handleOf',
        args: projectId
    })
    console.info("📗 FormattedProject >", projectId, rawHandle);

    return (
        <Link href={`/juicebox?project=${encodeURIComponent(projectId)}`}>
            <a className="text-sm hover:underline">
                @{(rawHandle && parseBytes32String(rawHandle)) || projectId}&nbsp;
            </a>
        </Link>
    )
}