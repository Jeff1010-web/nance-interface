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

interface SpaceInfo {
    name: string,
    about: string,
    avatar: string,
    proposalsCount: number,
    followersCount: number
}

export default function useSpaceInfo(spaceId: string): {data: SpaceInfo, loading: boolean} {
    const { loading, data } = useQuery(QUERY, {
        variables: {
            spaceId: spaceId
        }
    });
    console.info("📗 useSpaceInfo ->", {spaceId}, {data});
    return { loading, data: data?.space };
}