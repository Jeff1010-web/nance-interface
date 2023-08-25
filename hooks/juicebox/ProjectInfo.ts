import useSWR, { Fetcher } from "swr";
import { SUBGRAPH_URL } from "../../constants/Juicebox";
import fetchMetadata, { consolidateMetadata } from "../../libs/projectMetadata";

const projectQuery = `query project($id: ID!) {
    project(id: $id) {
        metadataUri
        owner
        handle
        volume
        redeemVolume
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
    volume: string
    redeemVolume: string
    trendingPaymentsCount: number
    trendingVolume: string
    currentBalance: string
    createdAt: number
}

const fetcher: Fetcher<ProjectInfo, {version: number, projectId: number}> = ({version, projectId}) => fetch(SUBGRAPH_URL, {
  method: "POST",
  body: JSON.stringify({ query: projectQuery, variables: { id: `${version}-${projectId}` } }),
}).then(res => res.json()).then(res => res.data.project);

export default function useProjectInfo(version: number | undefined, projectId: number | undefined) {

  const { data, error } = useSWR((version && projectId) ? {version: (version === 3 ? 2 : version), projectId} : null, fetcher);
  const loading = !error && !data;

  return { data, loading, error };
}