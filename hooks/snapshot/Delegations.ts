import { formatBytes32String } from "ethers/lib/utils";
import useSWR, { Fetcher } from "swr";
import { useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";

const QUERY = `query delegators($space: String, $address: Bytes) {
    delegations(where: {
      space: $space
      delegate: $address
    }) {
      delegator
    }
  }
`;

const fetcher: Fetcher<{ delegator: string }[], { space: string, address: string }> = ({ space, address }) => fetch(SUBGRAPH_URL, {
  method: "POST",
  body: JSON.stringify({ query: QUERY, variables: { space, address } }),
}).then(res => res.json()).then(res => res.data.delegations);

const SUBGRAPH_URL = `https://api.thegraph.com/subgraphs/id/${process.env.NEXT_PUBLIC_SNAPSHOT_SUBGRAPH_ID}`;

export default function useDelegators(space: string, address: string) {

  const { data, error } = useSWR({ space, address }, fetcher);
  const loading = !error && !data;

  return { data, loading, error }
}

export async function fetchDelegators(voter: string, space: string): Promise<{ delegator: string }[]> {
  return fetch(SUBGRAPH_URL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { address: voter, space }
    }),
  }).then(res => res.json()).then(json => json.data.delegations)
}

const SNAPSHOT_DELEGATE_REGISTRY_ADDRESS = '0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446'
const SNAPSHOT_DELEGATE_REGISTRY_ABI = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "delegator", "type": "address" }, { "indexed": true, "internalType": "bytes32", "name": "id", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "delegate", "type": "address" }], "name": "ClearDelegate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "delegator", "type": "address" }, { "indexed": true, "internalType": "bytes32", "name": "id", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "delegate", "type": "address" }], "name": "SetDelegate", "type": "event" }, { "inputs": [{ "internalType": "bytes32", "name": "id", "type": "bytes32" }], "name": "clearDelegate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "delegation", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "id", "type": "bytes32" }, { "internalType": "address", "name": "delegate", "type": "address" }], "name": "setDelegate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]

export function useSetDelegate(space: string, delegate: string) {
  const { config, error, isError } = usePrepareContractWrite({
    address: SNAPSHOT_DELEGATE_REGISTRY_ADDRESS,
    abi: SNAPSHOT_DELEGATE_REGISTRY_ABI,
    functionName: 'setDelegate',
    args: [formatBytes32String(space), delegate]
  })
  const { data, isLoading, isSuccess, write } = useContractWrite(config)

  return { data, isLoading, isSuccess, write, error }
}

export function useClearDelegate(space: string) {
  const { config, error, isError } = usePrepareContractWrite({
    address: SNAPSHOT_DELEGATE_REGISTRY_ADDRESS,
    abi: SNAPSHOT_DELEGATE_REGISTRY_ABI,
    functionName: 'clearDelegate',
    args: [formatBytes32String(space)]
  })
  const { data, isLoading, isSuccess, write } = useContractWrite(config)

  return { data, isLoading, isSuccess, write, error }
}

export function useDelegated(space: string, delegator: string) {
  const { data, isError, isLoading } = useContractRead({
    address: SNAPSHOT_DELEGATE_REGISTRY_ADDRESS,
    abi: SNAPSHOT_DELEGATE_REGISTRY_ABI,
    functionName: 'delegation',
    args: [delegator, formatBytes32String(space)]
  })

  return { data: data as string, isError, isLoading }
}
