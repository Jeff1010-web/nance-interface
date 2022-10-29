import useSWR, { Fetcher } from 'swr'
import { consolidateMetadata, ProjectMetadata } from '../../libs/projectMetadata';

const fetcher: Fetcher<ProjectMetadata, string> = (uri) => fetch(`https://jbx.mypinata.cloud/ipfs/${uri}`).then(res => res.json());

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