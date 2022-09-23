import Link from "next/link";
import useHandleOfProject from '../hooks/juicebox/HandleOfProject';

export interface Props {
    projectId: number;
}

export default function FormattedProject({ projectId }: Props) {
    const { value: handle } = useHandleOfProject({projectId});

    return (
        <Link href={`/juicebox?project=${encodeURIComponent(projectId)}`}>
            <a className="hover:underline">
                @{handle || projectId}&nbsp;
            </a>
        </Link>
    )
}