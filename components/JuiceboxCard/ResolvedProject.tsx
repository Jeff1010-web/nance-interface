import { classNames } from "@/utils/functions/tailwind";
import useProjectInfo from "@/utils/hooks/juicebox/ProjectInfo";

export interface Props {
  version?: number | undefined;
  projectId: number | undefined;
  style?: string;
  isTestnet?: boolean;
}

export default function ResolvedProject({
  version = 3,
  projectId,
  style,
  isTestnet,
}: Props) {
  const { data: projectInfo, loading, error } = useProjectInfo(3, projectId);

  if (loading) {
    return (
      <p className={classNames("mt-2 text-xs text-gray-500", style)}>
        loading...
      </p>
    );
  }

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={classNames(style, "hover:underline")}
      href={
        version == 1
          ? `https://${
              isTestnet ? "goerli." : ""
            }juicebox.money/p/${projectInfo?.handle}`
          : `https://${isTestnet ? "goerli." : ""}juicebox.money/${
              projectInfo?.handle
                ? `@${projectInfo?.handle}`
                : `v2/p/${projectId}`
            }`
      }
    >
      {isTestnet ? "Goerli" : ""}{" "}
      {projectInfo?.handle ? `@${projectInfo.handle}` : `Project #${projectId}`}
    </a>
  );
}
