import { useQuery } from "graphql-hooks";
import { SNAPSHOT_HEADERS, SNAPSHOT_HUB } from "@/constants/Snapshot";
import { SPACE_INFO_QUERY } from "./queries/Space";
import { SpaceInfo } from "@/models/SnapshotTypes";

export async function fetchSpaceInfo(spaceId: string): Promise<SpaceInfo> {
  return fetch(`${SNAPSHOT_HUB}graphql`, {
    method: "POST",
    headers: SNAPSHOT_HEADERS,
    body: JSON.stringify({ 
      query: SPACE_INFO_QUERY, 
      variables: { spaceId } 
    }),
  }).then(res => res.json()).then(json => json.data.space);
}

export default function useSnapshotSpaceInfo(spaceId: string): {data: SpaceInfo | undefined, loading: boolean} {
  const { loading, data } = useQuery<{space: SpaceInfo}>(SPACE_INFO_QUERY, {
    variables: {
      spaceId
    }
  });
  return { loading, data: data?.space };
}