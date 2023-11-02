import { useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import { usePublicClient } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { Interface } from 'ethers/lib/utils';
import { NetworkContext } from '../../context/NetworkContext';

const API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_KEY;

interface EtherscanAPIResponse {
  status: "1" | "0"
  message: "OK" | "NOTOK"
  result: any
}

const fetcher = (url: string) => fetch(url).then(res => res.json()).then((j: EtherscanAPIResponse) => {
  if (j.status != "1") {
    throw new Error(`Etherscan API Error: ${j.result}`);
  }
  return j.result;
});

export function useEtherscanAPIUrl() {
  const network = useContext(NetworkContext);
  return `https://api${network === mainnet.name ? "" : `-${network}`}.etherscan.io/api`;
}

export function useEtherscanContractABI(address: string, shouldFetch: boolean = true) {
  const [implementationAddress, setImplementationAddress] = useState("");
  const client = usePublicClient();
  const apiUrl = useEtherscanAPIUrl();
  const { data: abi, isLoading, error } = useSWR<string>(
    shouldFetch ? `${apiUrl}?module=contract&action=getabi&address=${implementationAddress || address}&apikey=${API_KEY}` : null,
    fetcher,
    //{ shouldRetryOnError: false }
  );

  useEffect(() => {
    let cancelled = false;

    const func = (async () => {
      if (abi && client && implementationAddress === "") {
        const ethersInterface = new Interface(abi);
        if (Object.values(ethersInterface.functions).length === 0) {
          // this maybe a proxy contract without any explicit function
          const proxyAddress = (await client.readContract({
            address: address as `0x${string}`,
            abi: [{
              name: 'masterCopy',
              type: 'function',
              stateMutability: 'view',
              inputs: [],
              outputs: [{ type: 'address' }],
            }],
            functionName: "masterCopy",
          })) as `0x${string}`;
          if (!cancelled) {
            setImplementationAddress(proxyAddress);
          }
        }
      }
    });
    func();

    return () => {
      cancelled = true;
    }
  }, [abi, client, implementationAddress, address]);

  return {
    data: abi,
    isLoading,
    error,
    isProxy: address !== implementationAddress
  };
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
  const apiUrl = useEtherscanAPIUrl();
  return useSWR<[EtherscanContractSource]>(
    shouldFetch ? `${apiUrl}?module=contract&action=getsourcecode&address=${contract}&apikey=${API_KEY}` : null,
    fetcher,
  );
}
