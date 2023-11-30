// use api to hide api-key
//export const SUBGRAPH_URL = `/api/juiceboxSubgraph`;
export function subgraphOf(network: string) {
  return `/api/juiceboxSubgraph?network=${network}`;
}
export const JB_IPFS_GATEWAY = "https://jbm.infura-ipfs.io/ipfs";

export function cidFromUrl(url: string | undefined) {
  return url?.split("/")?.pop();
}

export function ipfsUrlOf(cid: string | undefined) {
  return `${JB_IPFS_GATEWAY}/${cid}`;
}

export const JBDAO_LOGO = ipfsUrlOf(
  "QmWXCt1zYAJBkNb7cLXTNRNisuWu9mRAmXTaW9CLFYkWVS",
);
