import { useQuery } from "graphql-hooks";
import { SPACE_SETTINGS_QUERY } from "./queries/Space";
import { SpaceSettings } from "@/models/SnapshotTypes";

export default function useSnapshotSpaceSettings(spaceId: string): {data: SpaceSettings | undefined, loading: boolean} {
  const { loading, data } = useQuery<{space: SpaceSettings}>(SPACE_SETTINGS_QUERY, {
    variables: {
      spaceId
    }
  });
  return { loading, data: data?.space };
}