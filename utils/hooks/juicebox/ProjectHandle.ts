import { Fetcher } from "swr";
import useSWRImmutable from "swr/immutable";
import { subgraphOf } from "../../../constants/Juicebox";
import { NetworkContext } from "../../../context/NetworkContext";
import { useContext } from "react";

const projectHandleQuery = `query project($id: ID!) {
    project(id: $id) {
        handle
    }
  }
`;

const fetcher: Fetcher<
  string,
  { version: number; projectId: number; network: string }
> = ({ version, projectId, network }) =>
  fetch(subgraphOf(network), {
    method: "POST",
    body: JSON.stringify({
      query: projectHandleQuery,
      variables: { id: `${version}-${projectId}` },
    }),
  })
    .then((res) => res.json())
    .then((res) => res.data.project.handle);

export default function useProjectHandle(
  projectId: number | undefined,
  networkOverride?: string | undefined
) {
  const networkInContext = useContext(NetworkContext);
  const network = networkOverride || networkInContext;
  const { data, error } = useSWRImmutable(
    projectId ? { version: 2, projectId, network } : null,
    fetcher
  );
  const loading = !error && !data;

  return { data, loading, error };
}
