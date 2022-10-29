import { useQuery } from 'graphql-hooks'

const QUERY = `
query SpaceInfo($spaceId: String) {
    space(id: $spaceId) {
      name
      about
      avatar
      proposalsCount
      followersCount
    }
}
`

export interface SpaceInfo {
    name: string,
    about: string,
    avatar: string,
    proposalsCount: number,
    followersCount: number
}

export async function fetchSpaceInfo(spaceId: string): Promise<SpaceInfo> {
    return fetch('https://hub.snapshot.org/graphql', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: QUERY, 
        variables: { spaceId } 
      }),
    }).then(res => res.json()).then(json => json.data.space)
  }

export default function useSpaceInfo(spaceId: string): {data: SpaceInfo, loading: boolean} {
    const { loading, data } = useQuery(QUERY, {
        variables: {
            spaceId: spaceId
        }
    });
    return { loading, data: data?.space };
}