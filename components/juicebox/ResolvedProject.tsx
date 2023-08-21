import { useEffect, useState } from "react";
import fetchProjectInfo, { ProjectInfo } from "../../hooks/juicebox/Project";
import { classNames } from '../../libs/tailwind';

export interface Props {
    version: number | undefined;
    projectId: number | undefined;
    style?: string;
}

export default function ResolvedProject({ version, projectId, style }: Props) {
  // state
  const [isError, setError] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>();

  useEffect(() => {
    if(!version || !projectId) {
      setProjectInfo(undefined);
      setLoading(false);
      setError(true);
      return;
    }
    // external fetch
    fetchProjectInfo(version, projectId)
      .then((res) => {
        setProjectInfo(res.data.project);
        setLoading(false);
        setError(false);
      })
      .catch(e => {
        setLoading(false);
        setError(true);
      });
  }, [version, projectId]);

  if(isLoading) {
    return (
      <p className={classNames(
        "mt-2 text-xs text-gray-500",
        style
      )}>
                loading...
      </p>
    );
  }

  if(isError) {
    return <></>;
  }

  if(version == 1 && !projectInfo?.handle) {
    return (
      <span
        className={classNames(
          "text-xs text-gray-500",
          style,
        )}>
        {`Project #${projectId}`}
      </span>
    );
  }

  return (
    <a target="_blank" rel="noopener noreferrer"
      className={classNames(
        style,
        'hover:underline'
      )}
      href={version == 1 ? `https://juicebox.money/p/${projectInfo?.handle}` : `https://juicebox.money/${projectInfo?.handle ? `@${projectInfo?.handle}` : `v2/p/${projectId}`}`}>
      {projectInfo?.handle ? `@${projectInfo.handle}` : `Project #${projectId}`}
    </a>
  );
}