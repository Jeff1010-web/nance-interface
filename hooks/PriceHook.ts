import useSWR, { Fetcher } from 'swr'

const fetcher = (url) => fetch(url).then(res => res.json()).then(j => j.USD);

export function useTokenUsdPrice(token: string, shouldFetch: boolean = true) {
  return useSWR(
    shouldFetch ? `https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD` : null,
    fetcher,
  );
}
