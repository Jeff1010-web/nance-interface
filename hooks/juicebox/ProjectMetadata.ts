import useSWR, { Fetcher } from 'swr'
import { consolidateMetadata, ProjectMetadata } from '../../libs/projectMetadata';
import { JB_IPFS_GATEWAY } from "../../constants/Juicebox";

const fetcher: Fetcher<ProjectMetadata, string> = (uri) => fetch(`${JB_IPFS_GATEWAY}/${uri}`).then(res => res.json());

export default function useProjectMetadata(uri: string, shouldFetch: boolean = true) {
  const { data, error } = useSWR(shouldFetch ? uri : null, fetcher);
  const loading = !error && !data;

  if (!data) {
    return { data: null, loading, error };
  }

  return {
    data: consolidateMetadata(data),
    loading, error
  };
}
