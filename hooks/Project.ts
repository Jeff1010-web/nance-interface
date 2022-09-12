const SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/id/QmX4XXkA1XA1Fb8gQHd4TNvkRDQGPWZ2m7oANQG3W9iRq8";
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
    const response = await fetch(SUBGRAPH_URL, {
        method: "POST",
        body: JSON.stringify({ query: projectQuery, variables: { id: `${version}-${projectId}` } }),
    });
    return await response.json();
}