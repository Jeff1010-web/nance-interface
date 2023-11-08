import {
  useQueryParams,
  withDefault,
  NumberParam,
  StringParam,
} from "next-query-params";
import Image from "next/image";
import useProjectMetadata from "@/utils/hooks/juicebox/ProjectMetadata";
import ProjectLink from "../ProjectLink";

export default function JBProjectInfo({
  metadataUri,
}: {
  metadataUri: string;
}) {
  const [query, setQuery] = useQueryParams({
    project: withDefault(NumberParam, 1),
    safeTxHash: withDefault(StringParam, ""),
  });
  const { data: metadata } = useProjectMetadata(metadataUri);

  return (
    <div id="project-info" className="mx-6 flex flex-col items-center py-2">
      <Image
        className="mx-auto h-32 w-32 flex-shrink-0 rounded-full"
        src={metadata?.logoUri || "/images/juiceboxdao_logo.gif"}
        alt="project logo"
        height={128}
        width={128}
      />
      <p className="text-base font-medium text-gray-900">
        {metadata?.name || `Untitled Project (${query.project})`}
      </p>
      <dd className="line-clamp-3 w-1/3 break-words text-gray-700">
        {metadata?.description || "Loading metadata..."}
      </dd>
      <ProjectLink projectId={query.project} />
    </div>
  );
}
