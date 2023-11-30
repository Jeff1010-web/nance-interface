import { useState, useCallback } from "react";
import useSWR from "swr";

export interface JuiceboxProjectAPIResponse {
  id: string;
  handle: string | null;
  project_id: number;
  pv: string;
  current_balance: string;
  trending_score: string;
  total_paid: string;
  payments_count: number;
  terminal: string | null;
  deployer: string;
  created_at: number;
  name: string;
  description: string;
  logo_uri: string;
  metadata_uri: string;
  tags: string | null;
  archived: string | null;
  _updated_at: number;
  _has_unresolved_metadata: string | null;
  _metadata_retries_left: string | null;
}

type Params = {
  text?: string;
  pv?: string;
  orderBy?: string;
  archived?: boolean;
  orderDirection?: string;
  pageSize?: number;
  projectId?: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Search for projects on Juicebox with JBM Search API
 */
export default function useJBMSearch(
  params: Params,
  shouldFetch: boolean = true,
) {
  const [queryParams, setQueryParams] = useState<Params>(params);

  const queryString = useCallback(() => {
    let query = "";
    for (const key in queryParams) {
      if ((queryParams as any)[key] !== undefined) {
        query += `&${key}=${(queryParams as any)[key]}`;
      }
    }
    return query;
  }, [queryParams]);

  const { data, error } = useSWR<JuiceboxProjectAPIResponse[], any>(
    shouldFetch ? `https://juicebox.money/api/projects?${queryString()}` : null,
    fetcher,
  );

  const loading = !data && !error;

  return {
    projects: data,
    loading,
    error,
    setQueryParams,
  };
}
