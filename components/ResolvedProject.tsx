import { useEffect, useState } from "react";
import fetchProjectInfo, { ProjectInfo } from "../hooks/Project";


export interface Props {
    version: number;
    projectId: number;
    style?: string;
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function ResolvedProject({ version, projectId, style }: Props) {
    // state
    const [isError, setError] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [projectInfo, setProjectInfo] = useState<ProjectInfo>(undefined);

    useEffect(() => {
        if(!version || !projectId) {
            setProjectInfo(undefined);
            setLoading(false);
            setError(true);
            return;
        }
        // external fetch
        console.info('📗 ResolvedProject >', {version, projectId});
        fetchProjectInfo(version, projectId)
            .then((res) => {
                console.info('📗 ResolvedProject.then >', {res});
                setProjectInfo(res.data.project)
                setLoading(false);
                setError(false);
            })
            .catch(e => {
                console.error('📗 ResolvedProject.catch >', {e});
                setLoading(false);
                setError(true);
            })
    }, [version, projectId]);

    if(isLoading) {
        return (
            <p className={classNames(
                "mt-2 text-xs text-gray-500",
                style
            )}>
                loading...
            </p>
        )
    }

    if(isError) {
        return <></>
    }

    if(version == 1 && !projectInfo?.handle) {
        return (
            <span
                className={classNames(
                    "text-xs text-gray-500",
                    style,
                )}>
                {`Project #${projectId} (V${version})`}
            </span>
        )
    }

    return (
        <a target="_blank" rel="noopener noreferrer"
            className={classNames(
                "text-xs text-gray-500 hover:underline",
                style,
            )}
            href={version == 1 ? `https://juicebox.money/p/${projectInfo?.handle}` : `https://juicebox.money/${projectInfo?.handle ? `@${projectInfo?.handle}` : `v2/p/${projectId}`}`}>
            {projectInfo?.handle ? `@${projectInfo.handle} (V${version})` : `Project #${projectId} (V${version})`}
        </a>
    )
}