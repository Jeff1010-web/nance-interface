export const NANCE_API_URL = process.env.NEXT_PUBLIC_NANCE_API_URL || "https://api.nance.app";
export const NANCE_PROXY_API_URL = "/api/nance";
// FIXME should not has fixed value for generic nance.app
export const NANCE_DEFAULT_JUICEBOX_PROJECT: number = 1;
export const NANCE_DEFAULT_IPFS_GATEWAY = 'https://nance.infura-ipfs.io';
export const NANCE_PUBLIC_ADDRESS = '0x50e70c43a5DD812e2309eAcea61348041011b4BA';

export const proposalSetStatuses = {
  0: "Discussion",
  1: "Draft",
  2: "Revoked",
  3: "Archived",
};

export const ProposalStatus = [
  {
    title: "Publish",
    description: "Publish your proposal and let people join the discussion.",
    value: "Discussion",
    display: "Publish",
  },
  {
    title: "Draft",
    description: "Save your proposal as draft, you can publish it later.",
    value: "Draft",
    display: "Save as Draft",
  },
  {
    title: "Private Draft",
    description:
      "Save your proposal as private, you can publish it later for discussion.",
    value: "Private",
    display: "Save as Private",
  },
];

export const TEMPLATE =
  "## Synopsis\n*State what the proposal does in one sentence.*\n\n## Motivation\n*What problem does this solve? Why now?*\n\n## Specification\n*How exactly will this be executed? Be specific and leave no ambiguity.*\n\n## Rationale\n*Why is this specification appropriate?*\n\n## Risks\n*What might go wrong?*\n\n## Timeline\n*When exactly should this proposal take effect? When exactly should this proposal end?*";
