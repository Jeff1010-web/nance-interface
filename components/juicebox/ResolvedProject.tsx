import { classNames } from '../../libs/tailwind';
import useProjectInfo from "../../hooks/juicebox/ProjectInfo";

export interface Props {
    version?: number | undefined;
    projectId: number | undefined;
    style?: string;
}

export default function ResolvedProject({ version = 3, projectId, style }: Props) {
  const { data: projectInfo, loading, error } = useProjectInfo(3, projectId);

  if(loading) {
    return (
      <p className={classNames(
        "mt-2 text-xs text-gray-500",
        style
      )}>
                loading...
      </p>
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