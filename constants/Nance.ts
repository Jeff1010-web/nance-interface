export const NANCE_API_URL = process.env.NEXT_PUBLIC_NANCE_API_URL || "https://api.nance.app";
export const NANCE_DEFAULT_SPACE = process.env.NEXT_PUBLIC_OVERRIDE_SPACE || "juicebox";
export const NANCE_DEFAULT_JUICEBOX_PROJECT: number = 1;
export const NANCE_DEFAULT_IPFS_GATEWAY = 'https://nance.infura-ipfs.io';

export const proposalSetStatuses = {
  0: "Discussion",
  1: "Draft",
  2: "Revoked",
  3: "Archived",
};
