import useSWR, { Fetcher } from "swr";
import { SUBGRAPH_URL } from "../../constants/Juicebox";
import fetchMetadata, { consolidateMetadata } from "../../libs/projectMetadata";

const projectQuery = `query project($id: ID!) {
    project(id: $id) {
        metadataUri
        owner
        handle
        totalPaid
        totalRedeemed
        trendingPaymentsCount
        trendingVolume
        currentBalance
        createdAt
    }
  }
`;

export interface ProjectInfo {
    metadataUri: string
    owner: string
    handle: string
    totalPaid: string
    totalRedeemed: string
    trendingPaymentsCount: number
    trendingVolume: string
    currentBalance: string
    createdAt: number
}

const fetcher: Fetcher<ProjectInfo, {version: number, projectId: number}> = ({version, projectId}) => fetch(SUBGRAPH_URL, {
  method: "POST",
  body: JSON.stringify({ query: projectQuery, variables: { id: `${version}-${projectId}` } }),
}).then(res => res.json()).then(res => res.data.project);

export default function useProjectInfo(version: number, projectId: number) {

  const { data, error } = useSWR({version: version === 3 ? 2 : version, projectId}, fetcher);
  const loading = !error && !data;

  return { data, loading, error };
}

export function useResolvedProjectMetadata(metadataUri: string) {
  const { data: metadata, error } = useSWR(metadataUri, fetchMetadata);
  const loading = !error && !metadata;

  return { data: metadata ? consolidateMetadata(metadata) : undefined, loading, error };
}