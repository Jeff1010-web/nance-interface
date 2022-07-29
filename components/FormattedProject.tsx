import { useContractRead } from 'wagmi';
import { parseBytes32String } from '@ethersproject/strings'
import { ProjectsContract } from "../libs/contractsV1";
import Link from "next/link";

export interface Props {
    projectId: number;
}

export default function FormattedProject({ projectId }: Props) {
    const { data: rawHandle, isLoading } = useContractRead({
        ...ProjectsContract,
        functionName: 'handleOf',
        args: projectId
    });

    return (
        <Link href={`/juicebox?project=${encodeURIComponent(projectId)}`}>
            <a className="hover:underline">
                @{(rawHandle && parseBytes32String(rawHandle)) || projectId}&nbsp;
            </a>
        </Link>
    )
}