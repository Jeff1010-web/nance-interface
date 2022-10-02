import useSWR, { Fetcher } from 'swr'
import { NANCE_API_URL } from "../constants/Nance"
import { Proposal } from '../models/NanceTypes';

interface BaseRequest {
    space: string;
}

interface SpaceQueryRequest extends BaseRequest {
    cycle: number | undefined;
}
interface SpaceQueryResponse {
    proposals: Proposal[];
    space: {
        name: string,
        currentCycle: number
    }
}

interface ProposalMarkdownRequest extends BaseRequest {
    hash: string;
}
//type ProposalMarkdownResponse = string

function jsonFetcher<DataType>(): Fetcher<DataType, string> {
    return (url) => fetch(url).then(r => r.json())
}
function textFetcher(): Fetcher<string, string> {
    return (url) => fetch(url).then(r => r.text())
}

export function useSpaceQuery(args: SpaceQueryRequest, shouldFetch: boolean = true) {
    const { data, error } = useSWR(
        shouldFetch ? `${NANCE_API_URL}/${args.space}/query/${(args.cycle ? `?cycle=${args.cycle}` : '')}` : null,
        jsonFetcher<SpaceQueryResponse>(),
    );
    return {
        data, error,
        loading: !error && !data,
    };
}

export function useProposalMarkdown(args: ProposalMarkdownRequest, shouldFetch: boolean = true) {
    const { data, error } = useSWR(
        shouldFetch ? `${NANCE_API_URL}/${args.space}/markdown?hash=${args.hash}` : null,
        textFetcher(),
    );
    return {
        data, error,
        loading: !error && !data,
    };
}