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

export default async function fetchProjectInfo(version: number, projectId: number) {
    let convertedVersion = version;
    if (version === 3) {
        // Juicebox v3 are using same JBProjects contract as v2
        convertedVersion = 2;
    }
    const response = await fetch(SUBGRAPH_URL, {
        method: "POST",
        body: JSON.stringify({ query: projectQuery, variables: { id: `${convertedVersion}-${projectId}` } }),
    });
    return await response.json();
}