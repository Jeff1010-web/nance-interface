import useSWR, { Fetcher } from "swr";
import { subgraphOf } from "../../constants/Juicebox";
import { NetworkContext } from "../../context/NetworkContext";
import { useContext } from "react";

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

const fetcher: Fetcher<ProjectInfo, { version: number, projectId: number, network: string }> =
  ({ version, projectId, network }) => fetch(subgraphOf(network), {
    method: "POST",
    body: JSON.stringify({ query: projectQuery, variables: { id: `${version}-${projectId}` } }),
  }).then(res => res.json()).then(res => res.data.project);

export default function useProjectInfo(version: number | undefined, projectId: number | undefined) {
  const network = useContext(NetworkContext);
  const { data, error } = useSWR((version && projectId) ? { version: (version === 3 ? 2 : version), projectId, network } : null, fetcher);
  const loading = !error && !data;

  return { data, loading, error };
}
