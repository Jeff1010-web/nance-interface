import useSWR, { Fetcher } from 'swr'
import useSWRMutation from 'swr/mutation'
import { NANCE_PROXY_API_URL } from "../constants/Nance"
import {
    APIResponse,
    ProposalsRequest,
    SpaceInfoRequest,
    ProposalRequest,
    ProposalUploadRequest,
    FetchReconfigureRequest,
    SpaceInfo,
    Proposal,
    FetchReconfigureData,
    ProposalUploadPayload,
    ProposalDeleteRequest,
    ProposalsPacket,
} from '../models/NanceTypes';

function jsonFetcher(): Fetcher<APIResponse<any>, string> {
    return async (url) => {
        const res = await fetch(url)
        const json = await res.json()
        if (json?.success === 'false') {
            throw new Error(`An error occurred while fetching the data: ${json?.error}`)
        }
        return json
    }
}

export function useAllSpaceInfo(shouldFetch: boolean = true) {
    return useSWR<APIResponse<SpaceInfo[]>>(
        shouldFetch ? `${NANCE_PROXY_API_URL}/ish/all` : null,
        jsonFetcher()
    );
}

export function useSpaceInfo(args: SpaceInfoRequest, shouldFetch: boolean = true) {
    return useSWR<APIResponse<SpaceInfo>, string>(
        shouldFetch ? `${NANCE_PROXY_API_URL}/${args.space}` : null,
        jsonFetcher()
    );
}

export function useProposals(args: ProposalsRequest, shouldFetch: boolean = true) {
    const urlParams = new URLSearchParams();
    if (args.cycle) {
        urlParams.set('cycle', args.cycle.toString());
    }
    if (args.keyword) {
        urlParams.set('keyword', args.keyword);
    }
    if (args.limit) {
        urlParams.set('limit', args.limit.toString());
    }
    if (args.page) {
        urlParams.set('page', args.page.toString());
    }

    return useSWR<APIResponse<ProposalsPacket>, string>(
        shouldFetch ? `${NANCE_PROXY_API_URL}/${args.space}/proposals?` + urlParams.toString() : null,
        jsonFetcher(),
    );
}

export function useProposal(args: ProposalRequest, shouldFetch: boolean = true) {
    return useSWR<APIResponse<Proposal>, string>(
        shouldFetch ? `${NANCE_PROXY_API_URL}/${args.space}/proposal/${args.hash}` : null,
        jsonFetcher(),
    );
}

export function useReconfigureRequest(args: FetchReconfigureRequest, shouldFetch: boolean = true) {
    return useSWR<APIResponse<FetchReconfigureData>, string>(
        shouldFetch ? `${NANCE_PROXY_API_URL}/${args.space}/reconfigure?version=${args.version}&address=${args.address}&datetime=${args.datetime}&network=${args.network}` : null,
        jsonFetcher(),
    );
}

async function uploader(url: RequestInfo | URL, { arg }: { arg: ProposalUploadRequest }) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(arg),
    })
    const json: APIResponse<ProposalUploadPayload> = await res.json()
    if (json.success === false) {
        throw new Error(`An error occurred while uploading the data: ${json?.error}`)
    }

    return json
}

export function useProposalUpload(space: string, proposalId: string | undefined, shouldFetch: boolean = true) {
    let url = `${NANCE_PROXY_API_URL}/${space}/proposals`
    let fetcher = uploader
    if(proposalId) {
        url = `${NANCE_PROXY_API_URL}/${space}/proposal/${proposalId}`
        fetcher = editor
    }
    return useSWRMutation(
        shouldFetch ? url : null,
        fetcher,
    );
}

export function useProposalDelete(space: string, uuid: string | undefined, shouldFetch: boolean = true) {
    let url = `${NANCE_PROXY_API_URL}/${space}/proposal/${uuid}`
    let fetcher = deleter
    return useSWRMutation(
        shouldFetch ? url : null,
        fetcher,
    );
}

async function editor(url: RequestInfo | URL, { arg }: { arg: ProposalUploadRequest }) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(arg)
    })
    const json: APIResponse<ProposalUploadPayload> = await res.json()
    if (json.success === false) {
        throw new Error(`An error occurred while uploading the data: ${json?.error}`)
    }

    return json
}

async function deleter(url: RequestInfo | URL, { arg }: { arg: ProposalDeleteRequest }) {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(arg)
    })
    const json: APIResponse<ProposalUploadPayload> = await res.json()
    if (json.success === false) {
        throw new Error(`An error occurred while deleting this proposal: ${json?.error}`)
    }

    return json
}

export function getPath(space: string, command: string) {
    return `${NANCE_PROXY_API_URL}/${space}/${command}`;
}

export async function fetchCreatedProposals(space: string | undefined, author: string | undefined) {
    if(!space || !author) {
        return {
            success: true,
            data: {
                proposalInfo: {
                    proposalIdPrefix: "",
                    minTokenPassingAmount: 0
                },
                proposals: [],
                privateProposals: []
            }
        } as APIResponse<ProposalsPacket>;
    }

    const url = `${NANCE_PROXY_API_URL}/${space}/proposals/?author=${author}`;
    const res = await fetch(url);
    const json: APIResponse<ProposalsPacket> = await res.json();
    if (json.success === false) {
        console.warn("fetchCreatedProposals errors occurred: ", json.error)
    }
    
    return json
}