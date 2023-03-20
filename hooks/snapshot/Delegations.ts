import useSWR, { Fetcher } from "swr";

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
