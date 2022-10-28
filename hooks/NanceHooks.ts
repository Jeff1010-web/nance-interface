import useSWR, { Fetcher } from 'swr'
import useSWRMutation from 'swr/mutation'
import { NANCE_API_URL } from "../constants/Nance"
import {
    APIResponse,
    ProposalsQueryRequest,
    ProposalsQueryResponse,
    SpaceInfoRequest,
    SpaceInfoResponse,
    ProposalRequest,
    ProposalResponse,
    ProposalUploadRequest,
    ProposalUploadResponse,
    FetchReconfigureRequest,
    FetchReconfigureResponse,
    SubmitTransactionRequest,
    SubmitTransactionResponse
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

function jsonSpaceInfoFetcher(): Fetcher<SpaceInfoResponse, string> {
    return jsonFetcher();
}

function jsonProposalsQueryFetcher(): Fetcher<ProposalsQueryResponse, string> {
    return jsonFetcher();
}

function jsonProposalFetcher(): Fetcher<ProposalResponse, string> {
    return jsonFetcher();
}

export function useSpaceInfo(args: SpaceInfoRequest, shouldFetch: boolean = true) {
    return useSWR(
        shouldFetch ? `${NANCE_API_URL}/${args.space}` : null,
        jsonSpaceInfoFetcher()
    );
}

export function useProposalsQuery(args: ProposalsQueryRequest, shouldFetch: boolean = true) {
    return useSWR(
        shouldFetch ? `${NANCE_API_URL}/${args.space}/query/${(args.cycle ? `?cycle=${args.cycle}` : '')}` : null,
        jsonProposalsQueryFetcher(),
    );
}

export function useProposalRequest(args: ProposalRequest, shouldFetch: boolean = true) {
    return useSWR(
        shouldFetch ? `${NANCE_API_URL}/${args.space}/proposal?hash=${args.hash}` : null,
        jsonProposalFetcher(),
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
    const json: ProposalUploadResponse = await res.json()
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

async function jsonReconfigureFecther(url: RequestInfo | URL, { arg }: { arg: FetchReconfigureRequest }): Promise<FetchReconfigureResponse> {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(arg)
      })
      const json: FetchReconfigureResponse = await res.json()
      if (json.success === false) {
          throw new Error(`An error occurred while uploading the data: ${json?.error}`)
      }

    return json
}

export function UseReconfigureRequest(args: FetchReconfigureRequest) {
    return jsonReconfigureFecther(`${NANCE_API_URL}/${args.space}/reconfigure?version=${args.version}`, { arg: args });
}
