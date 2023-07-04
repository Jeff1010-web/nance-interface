import { useQuery } from 'graphql-hooks'

const QUERY = `
query SpaceInfo($spaceId: String) {
  space(id: $spaceId) {
    name
    about
    avatar
    proposalsCount
    followersCount
    voting {
      hideAbstain
    }
  }
}
`

export interface SpaceInfo {
    name: string,
    about: string,
    avatar: string,
    proposalsCount: number,
    followersCount: number,
    voting: {
      hideAbstain: boolean
    }
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

export default function useSnapshotSpaceInfo(spaceId: string): {data: SpaceInfo | undefined, loading: boolean} {
    const { loading, data } = useQuery<{space: SpaceInfo}>(QUERY, {
        variables: {
          spaceId
        }
    });
    return { loading, data: data?.space };
}