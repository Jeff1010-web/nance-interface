import { useQuery } from 'graphql-hooks'

const QUERY = `
query Ranking($search: String) {
  ranking(
    first: 20
    skip: 0
    where: {search: $search }
  ) {
    items {
      id
      name
      avatar
      admins
      moderators
    }
  }
}
`

export interface SpaceSearch {
    id: string,
    name: string,
    avatar: string,
    admins: string[],
    moderators: string[]
}

export default function useSnapshotSearch(search: string): {data: SpaceSearch[] | undefined, loading: boolean} {
    const { loading, data } = useQuery<{ranking: { items: SpaceSearch[] }}>(QUERY, {
        variables: {
          search
        }
    });
    return { loading, data: data?.ranking.items };
}