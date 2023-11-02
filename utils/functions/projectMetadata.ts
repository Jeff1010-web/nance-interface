import { JB_IPFS_GATEWAY } from "../../constants/Juicebox";

type TokenRef = {
    value: string
    type: 'project' | 'erc20'
  }
  

export type ProjectMetadata =
  | ProjectMetadataV1
  | ProjectMetadataV2
  | ProjectMetadataV3
  | ProjectMetadataV4

type ProjectMetadataV1 = Partial<{
  name: string
  description: string
  logoUri: string
  infoUri: string
  payText: string
  version: 1
}>

// add `tokens`
type ProjectMetadataV2 = Partial<
  Omit<ProjectMetadataV1, 'version'> & {
    version: 2
    tokens: TokenRef[]
  }
>

// `payText` -> `payButton`
type ProjectMetadataV3 = Partial<
  Omit<ProjectMetadataV2, 'version' | 'payText'> & {
    version: 3
    twitter: string
    discord: string
    payButton: string
    payDisclosure: string
  }
>

// add `archived`
export type ProjectMetadataV4 = Partial<
  Omit<ProjectMetadataV3, 'version'> & {
    version: 4
    archived: boolean
  }
>

// Converts metadata of any version to latest version
export const consolidateMetadata = (
  metadata: ProjectMetadata,
): ProjectMetadataV4 => {
  return {
    ...metadata,
    payButton:
      (metadata as ProjectMetadataV3).payButton ??
      (metadata as ProjectMetadataV2).payText,
    version: 4,
  };
};

export default async function fetchMetadata(uri: string): Promise<ProjectMetadata> {
  const res = await fetch(`${JB_IPFS_GATEWAY}/${uri}`);
  return await res.json();
}