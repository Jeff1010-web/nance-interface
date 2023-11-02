import useSWR, { Fetcher } from 'swr';
import { consolidateMetadata, ProjectMetadata } from '../../functions/projectMetadata';
import { JB_IPFS_GATEWAY } from "../../../constants/Juicebox";

const fetcher: Fetcher<ProjectMetadata, string> = (uri) => fetch(`${JB_IPFS_GATEWAY}/${uri}`).then(res => res.json());

export default function useProjectMetadata(uri: string, shouldFetch: boolean = true) {
  const { data, error } = useSWR(shouldFetch ? uri : null, fetcher);
  const loading = !error && !data;

  if (!data) {
    return { data: null, loading, error };
  }

  const ret = consolidateMetadata(data);
  if (ret.logoUri?.startsWith("https://jbx.mypinata.cloud/ipfs")) {
    ret.logoUri = ret.logoUri.replace("https://jbx.mypinata.cloud/ipfs", JB_IPFS_GATEWAY)
  }
  else if (ret.logoUri?.startsWith("ipfs://")) {
    ret.logoUri = ret.logoUri.replace("ipfs://", JB_IPFS_GATEWAY)
  }

  return {
    data: ret,
    loading, error
  };
}
