import { NANCE_API_URL } from "../constants/Nance";
import { APIResponse, SpaceInfo, ProposalsPacket } from '../models/NanceTypes';

export function getLastSlash(url: string | undefined): string {
  if(!url) return "";

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

export function canEditProposal(status: string | undefined) {
  return ([
    'Discussion',
    'Draft',
    'Temperature Check',
    'Private',
    'Archived',
    undefined,
  ].includes(status));
};

export async function getNanceStaticPaths() {
  const spaces: APIResponse<SpaceInfo[]> = await fetch(`${NANCE_API_URL}/ish/all`).then(res => res.json());
  const paths = await Promise.all(spaces.data.flatMap(async (space) => {
    const allCycles = Array.from({ length: space.currentCycle }, (_, index) => index + 1).join(',');
    const proposalsResponse: APIResponse<ProposalsPacket> = await fetch(`${NANCE_API_URL}/${space.name}/proposals?cycle=${allCycles}`).then(res => res.json());
    if (proposalsResponse.success) {
      return proposalsResponse.data.proposals.map((proposal) => {
        return {
          params: {
            space: space.name,
            proposal: proposal.hash
          }
        };
      });
    };
    console.error(`bad response for ${space.name}`);
    return [];
  }));
  return paths.flat();
}
