import useSWR, { Fetcher } from "swr";
import { SUBGRAPH_URL } from "../../constants/Juicebox";

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
}).then(res => res.json());

export default function useProjectInfo(version: number, projectId: number) {

    const { data, error } = useSWR({version, projectId}, fetcher);
    const loading = !error && !data;

    return { data, loading, error }
}