// use api to hide api-key
//export const SUBGRAPH_URL = `/api/juiceboxSubgraph`;
export function subgraphOf(network: string) {
  return `/api/juiceboxSubgraph?network=${network}`;
}
export const JB_IPFS_GATEWAY = 'https://jbm.infura-ipfs.io/ipfs';
