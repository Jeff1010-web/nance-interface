import { useQueryParams, withDefault, NumberParam, StringParam } from "next-query-params";
import ResolvedProject from "../../../components/juicebox/ResolvedProject";
import { JB_IPFS_GATEWAY } from "../../../constants/Juicebox";
import { useResolvedProjectMetadata } from "../../../hooks/juicebox/ProjectInfo";

export default function JBProjectInfo({ metadataUri }: { metadataUri: string }) {
  const [query, setQuery] = useQueryParams({
    project: withDefault(NumberParam, 1),
    safeTxHash: withDefault(StringParam, "")
  });
  const { data: metadata } = useResolvedProjectMetadata(metadataUri);

  const logo = (metadata?.logoUri?.includes('ipfs://')) ? `${JB_IPFS_GATEWAY}/${metadata?.logoUri?.split('ipfs://')[1]}` : metadata?.logoUri;

  return (
    <div id="project-info" className="flex flex-col items-center py-2 mx-6">
      <img className="mx-auto h-32 w-32 flex-shrink-0 rounded-full" src={logo || '/images/juiceboxdao_logo.gif'} alt="project logo" />
      <p className="text-base font-medium text-gray-900">{metadata?.name || `Untitled Project (${query.project})`}</p>
      <dd className="text-gray-700 break-words line-clamp-3 w-1/3">{metadata?.description || 'Loading metadata...'}</dd>
      <ResolvedProject projectId={query.project} />
    </div>
  )
}