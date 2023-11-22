import { useQuery } from "graphql-hooks";
import { SPACE_RANK_QUERY } from "./queries/Space";
import { SpaceSearch } from "@/models/SnapshotTypes";

export default function useSnapshotSearch(search: string): {data: SpaceSearch[] | undefined, loading: boolean} {
  const { loading, data } = useQuery<{ranking: { items: SpaceSearch[] }}>(SPACE_RANK_QUERY, {
    variables: {
      search
    }
  });
  return { loading, data: data?.ranking.items };
}