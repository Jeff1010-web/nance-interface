import useSWR, { Fetcher } from 'swr'

const API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_KEY

interface EtherscanAPIResponse {
  status: "1" | "0"
  message: "OK" | "NOTOK"
  result: any
}

const fetcher = (url) => fetch(url).then(res => res.json()).then((j: EtherscanAPIResponse) => {
  if(j.status != "1") {
    throw new Error(`Etherscan API Error: ${j.result}`)
  }
  return j.result
});

export function useEtherscanContractABI(contract: string, shouldFetch: boolean = true) {
  return useSWR(
    shouldFetch ? `https://api.etherscan.io/api?module=contract&action=getabi&address=${contract}&apikey=${API_KEY}` : null,
    fetcher,
  );
}
