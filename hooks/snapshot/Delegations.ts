import useSWR, { Fetcher } from "swr";

const query = `query delegators($space: String, $address: Bytes) {
    delegations(where: {
      space: $space
      delegate: $address
    }) {
      id
      delegator
    }
  }
`;

const fetcher: Fetcher<{ delegator: string }[], { space: string, address: string }> = ({ space, address }) => fetch(SUBGRAPH_URL, {
  method: "POST",
  body: JSON.stringify({ query: query, variables: { space, address } }),
}).then(res => res.json()).then(res => res.data.delegations);

const SUBGRAPH_URL = `https://api.thegraph.com/subgraphs/id/${process.env.NEXT_PUBLIC_SNAPSHOT_SUBGRAPH_ID}`;

export default function useDelegators(space: string, address: string) {

  const { data, error } = useSWR({ space, address }, fetcher);
  const loading = !error && !data;

  return { data, loading, error }
}
