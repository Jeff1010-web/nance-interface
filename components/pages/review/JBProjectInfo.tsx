import { useQueryParams, withDefault, NumberParam, StringParam } from "next-query-params";
import ResolvedProject from "../../../components/juicebox/ResolvedProject";
import Image from "next/image";
import useProjectMetadata from "../../../utils/hooks/juicebox/ProjectMetadata";

export default function JBProjectInfo({ metadataUri }: { metadataUri: string }) {
  const [query, setQuery] = useQueryParams({
    project: withDefault(NumberParam, 1),
    safeTxHash: withDefault(StringParam, "")
  });
  const { data: metadata } = useProjectMetadata(metadataUri);
  
  return (
    <div id="project-info" className="flex flex-col items-center py-2 mx-6">
      <Image className="mx-auto h-32 w-32 flex-shrink-0 rounded-full" src={metadata?.logoUri || '/images/juiceboxdao_logo.gif'} alt="project logo" height={128} width={128} />
      <p className="text-base font-medium text-gray-900">{metadata?.name || `Untitled Project (${query.project})`}</p>
      <dd className="text-gray-700 break-words line-clamp-3 w-1/3">{metadata?.description || 'Loading metadata...'}</dd>
      <ResolvedProject projectId={query.project} />
    </div>
  );
}