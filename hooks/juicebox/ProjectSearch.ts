import useSWR, { Fetcher } from "swr";
import { SUBGRAPH_URL } from "../../constants/Juicebox";

const projectQuery = `query Project($first: Int, $keyword: String) {
    projects(
      first: $first, 
      where: {
        handle_contains: $keyword
      },
      orderBy: trendingScore,
      orderDirection: desc
    ) {
      id
      cv
      owner
      handle
      projectId
      createdAt
      metadataUri
    }
}`;

export interface ProjectSearchEntry {
    id: string
    cv: string
    owner: string
    handle: string
    projectId: number
    createdAt: number
    metadataUri: string
}

const fetcher: Fetcher<ProjectSearchEntry[], {keyword: string, limit: number}> = ({keyword, limit}) => fetch(SUBGRAPH_URL, {
    method: "POST",
    body: JSON.stringify({ 
        query: projectQuery, 
        variables: { 
            first: limit,
            keyword
        } 
    }),
}).then(res => res.json()).then(res => res.data.projects);

export default function useProjectSearch(keyword: string, limit: number = 20) {

    const { data, error } = useSWR({keyword, limit}, fetcher);
    const loading = !error && !data;

    return { data, loading, error }
}