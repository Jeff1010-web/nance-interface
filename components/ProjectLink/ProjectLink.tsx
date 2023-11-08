import { classNames } from "@/utils/functions/tailwind";
import useProjectHandle from "@/utils/hooks/juicebox/ProjectHandle";

interface Props {
  /**
   * The ID of the project to link to.
   */
  projectId: number | undefined;
  /**
   * The style of the link.
   */
  style?: string;
  /**
   * Whether or not the project deployed on testnet (goerli).
   */
  isTestnet?: boolean;
}

/**
 * Displays a link to a project on Juicebox.
 */
export default function ProjectLink({ projectId, style, isTestnet }: Props) {
  const { data: handle } = useProjectHandle(
    projectId,
    isTestnet ? "goerli" : "mainnet"
  );

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
