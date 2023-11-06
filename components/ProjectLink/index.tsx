import useProjectHandle from "@/utils/hooks/juicebox/ProjectHandle";
import ProjectLink from "./ProjectLink";

interface Props {
  projectId: number | undefined;
  style?: string;
  isTestnet?: boolean;
}

export default function ProjectHandleLink({
  projectId,
  style,
  isTestnet,
}: Props) {
  const { data: handle } = useProjectHandle(
    projectId,
    isTestnet ? "goerli" : "mainnet"
  );

  return (
    <ProjectLink
      handle={handle}
      projectId={projectId}
      style={style}
      isTestnet={isTestnet}
    />
  );
}
