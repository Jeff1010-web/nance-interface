import { NANCE_API_URL } from "../constants/Nance";

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

export function canEditProposal(status: string) {
  return ([
    'Discussion',
    'Draft',
    'Temperature Check',
    'Private',
    'Archived',
    undefined,
  ].includes(status));
};
