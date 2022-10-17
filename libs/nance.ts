import { NANCE_API_URL } from "../constants/Nance";

export function getLastSlash(url) {
    if(!url) return url;

    const split = url.split('/');
    return split[split.length - 1].trim();
}

export function urlOfUpload(space: string) {
    return `${NANCE_API_URL}/${space}/upload/`;
}

export function urlOfQuery(space: string, cycle: number | undefined) {
    return `${NANCE_API_URL}/${space}/query/${(cycle ? `?cycle=${cycle}` : '')}`;
}

export function urlOfContent(space: string, hash: string) {
    return `${NANCE_API_URL}/${space}/markdown?hash=${hash}`;
}

export function nanceDataTransform(formData: any, metadata: any) {
    const proposal = formData.proposal;
    proposal.type = metadata.proposalType;
    proposal.version = `V${metadata.version}`;
    proposal.payout.address = (proposal.payout.project) ? `${proposal.version}:${proposal.payout.project}` : proposal.payout.address;
    return proposal;
}