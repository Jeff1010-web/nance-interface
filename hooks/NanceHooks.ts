import useSWR, { Fetcher } from 'swr'
import useSWRMutation from 'swr/mutation'
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

type ProposalType = "Payout" | "ReservedToken" | "ParameterUpdate" | "ProcessUpdate" | "CustomTransaction";
export interface ProposalUploadBaseRequest {
    type: ProposalType;
    version: number;
    project: number;
    proposal: {
        title: string;
        body: string;
    }
    notification: {
        expiry: boolean;
        execution: boolean;
        progress: boolean;
    }
}
export type ProposalUploadResponse = {
    status: "ok";
    data: string;
} | {
    status: "error";
    data: any;
}
interface PayoutProposalUploadRequest extends ProposalUploadBaseRequest {
    type: "Payout";
    payout: {
        type: "Address" | "Project";
        duration: number;
        amount: number;
        project: number;
        address: string;
    }
}

function jsonFetcher<DataType>(): Fetcher<DataType, string> {
    return (url) => fetch(url).then(r => r.json())
}
export function useSpaceQuery(args: SpaceQueryRequest, shouldFetch: boolean = true) {
    return useSWR(
        shouldFetch ? `${NANCE_API_URL}/${args.space}/query/${(args.cycle ? `?cycle=${args.cycle}` : '')}` : null,
        jsonFetcher<SpaceQueryResponse>(),
    );
}

function textFetcher(): Fetcher<string, string> {
    return (url) => fetch(url).then(r => r.text())
}
export function useProposalMarkdown(args: ProposalMarkdownRequest, shouldFetch: boolean = true) {
    return useSWR(
        shouldFetch ? `${NANCE_API_URL}/${args.space}/markdown?hash=${args.hash}` : null,
        textFetcher(),
    );
}

async function uploader(url: RequestInfo | URL, { arg }: { arg: ProposalUploadBaseRequest }) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(arg)
    })
    const json: ProposalUploadResponse = await res.json()
    if (json.status === 'error') {
        throw new Error('An error occurred while fetching the data.', { cause: json.data })
    }

    return json
}
export function useProposalUpload(space: string, shouldFetch: boolean = true) {
    return useSWRMutation(
        shouldFetch ? `${NANCE_API_URL}/${space}/upload` : null,
        uploader,
    );
}