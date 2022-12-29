import useSWR, { Fetcher } from 'swr'
import useSWRMutation from 'swr/mutation'
import { NANCE_API_URL } from "../constants/Nance"
import {
    APIResponse,
    ProposalsQueryRequest,
    SpaceInfoRequest,
    ProposalRequest,
    ProposalUploadRequest,
    FetchReconfigureRequest,
    SpaceInfo,
    Proposal,
    FetchReconfigureData,
    ProposalUploadPayload
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

export function useSpaceInfo(args: SpaceInfoRequest, shouldFetch: boolean = true) {
    return useSWR<APIResponse<SpaceInfo>, string>(
        shouldFetch ? `${NANCE_API_URL}/${args.space}` : null,
        jsonFetcher()
    );
}

export function useProposalsQuery(args: ProposalsQueryRequest, shouldFetch: boolean = true) {
    return useSWR<APIResponse<Proposal[]>, string>(
        shouldFetch ? `${NANCE_API_URL}/${args.space}/query/${(args.cycle ? `?cycle=${args.cycle}` : '')}` : null,
        jsonFetcher(),
    );
}

export function useProposalRequest(args: ProposalRequest, shouldFetch: boolean = true) {
    return useSWR<APIResponse<Proposal>, string>(
        shouldFetch ? `${NANCE_API_URL}/${args.space}/proposal?hash=${args.hash}` : null,
        jsonFetcher(),
    );
}

export function useReconfigureRequest(args: FetchReconfigureRequest, shouldFetch: boolean = true) {
    return useSWR<APIResponse<FetchReconfigureData>, string>(
        shouldFetch ? `${NANCE_API_URL}/${args.space}/reconfigure?version=${args.version}&address=${args.address}&datetime=${args.datetime}&network=${args.network}` : null,
        jsonFetcher(),
    );
}

async function uploader(url: RequestInfo | URL, { arg }: { arg: ProposalUploadRequest }) {
    const res = await fetch(url, {
      method: 'POST',
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

export function useProposalUpload(space: string, shouldFetch: boolean = true) {
    return useSWRMutation(
        shouldFetch ? `${NANCE_API_URL}/${space}/upload` : null,
        uploader,
    );
}

export function getPath(space: string, command: string) {
    return `${NANCE_API_URL}/${space}/${command}`;
}
