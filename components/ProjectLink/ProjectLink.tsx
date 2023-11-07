import { classNames } from "@/utils/functions/tailwind";
import useProjectHandle from "@/utils/hooks/juicebox/ProjectHandle";

interface Props {
  projectId: number | undefined;
  handle?: string;
  style?: string;
  isTestnet?: boolean;
}

export default function ProjectLink({
  projectId,
  handle,
  style,
  isTestnet,
}: Props) {
  if (!projectId || projectId <= 0) {
    return (
      <a className={classNames(style, "cursor-not-allowed")} href="#">
        No project
      </a>
    );
  }

  const host = isTestnet
    ? "https://goerli.juicebox.money"
    : "https://juicebox.money";
  const projectUrl = handle
    ? `${host}/@${handle}`
    : `${host}/v2/p/${projectId}`;
  const networkSuffix = isTestnet ? " (goerli)" : "";
  const projectLabel =
    (handle ? `@${handle}` : `Project #${projectId}`) + networkSuffix;

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={classNames(style, "hover:underline")}
      href={projectUrl}
    >
      {projectLabel}
    </a>
  );
}
