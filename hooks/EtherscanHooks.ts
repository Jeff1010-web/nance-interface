import { Contract } from 'ethers'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { useProvider } from 'wagmi'

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

const MasterCopyFunction = "function masterCopy() external view returns (address)";
export function useEtherscanContractABI(initialAddress: string, shouldFetch: boolean = true) {
  const [address, setAddress] = useState(initialAddress);
  const provider = useProvider();
  const { data: abi, isLoading, error } = useSWR<string>(
    shouldFetch ? `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${API_KEY}` : null,
    fetcher,
  );

  useEffect(() => {
    (async () => {
      if (abi && provider) {
        const contract = new Contract(address, abi, provider);
        if (Object.values(contract.interface.functions).length === 0) {
          // this maybe a proxy contract without any explicit function
          const proxy = new Contract(address, [MasterCopyFunction], provider);
          // to retrieve real abi
          const proxyAddress = await proxy.masterCopy()
          console.debug("useEtherscanContractABI.proxy", initialAddress, address, proxyAddress);
          setAddress(proxyAddress);
        }
      }
    })()
  }, [address, abi, provider])

  return {
    data: abi,
    isLoading,
    error,
    isProxy: address === initialAddress
  }
}

interface EtherscanContractSource {
  SourceCode: string
  ABI: string
  ContractName: string
  CompilerVersion: string
  OptimizationUsed: string
  Runs: string
  ConstructorArguments: string
  EVMVersion: string
  Library: string
  LicenseType: string
  Proxy: string
  Implementation: string
  SwarmSource: string
}

export function useEtherscanContract(contract: string, shouldFetch: boolean = true) {
  return useSWR<[EtherscanContractSource]>(
    shouldFetch ? `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${contract}&apikey=${API_KEY}` : null,
    fetcher,
  );
}
