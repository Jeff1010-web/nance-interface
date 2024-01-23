import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { usePublicClient } from "wagmi";
import { mainnet } from "wagmi/chains";
import { Interface } from "ethers/lib/utils";
import { NetworkContext } from "../../context/NetworkContext";
import { trim } from "viem";

const API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_KEY;

interface EtherscanAPIResponse {
  status: "1" | "0";
  message: "OK" | "NOTOK";
  result: any;
}

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((j: EtherscanAPIResponse) => {
      if (j.status != "1") {
        throw new Error(`Etherscan API Error: ${j.result}`);
      }
      return j.result;
    });

export function useEtherscanAPIUrl() {
  const network = useContext(NetworkContext);
  return `https://api${
    network === mainnet.name ? "" : `-${network}`
  }.etherscan.io/api`;
}

// supported proxy pattern: EIP-1967 Proxy Storage Slots, EIP-897 DelegateProxy and Gnosis Safe Proxy
export function useEtherscanContractABI(
  address: string,
  shouldFetch: boolean = true,
) {
  const [implementationAddress, setImplementationAddress] = useState<string>();
  const client = usePublicClient();
  const apiUrl = useEtherscanAPIUrl();
  const {
    data: abi,
    isLoading,
    error,
  } = useSWR<string>(
    shouldFetch
      ? `${apiUrl}?module=contract&action=getabi&address=${
          implementationAddress || address
        }&apikey=${API_KEY}`
      : null,
    fetcher,
    //{ shouldRetryOnError: false }
  );

  useEffect(() => {
    let cancelled = false;

    const func = async () => {
      if (abi && client && implementationAddress === undefined) {
        const ethersInterface = new Interface(abi);
        if (Object.values(ethersInterface.functions).length === 0) {
          console.debug(
            "EtherscanHooks.proxy.slotType",
            address,
            ethersInterface,
          );

          // EIP-1967 Proxy Storage Slots
          // https://eips.ethereum.org/EIPS/eip-1967
          // test address: 0xcaD88677CA87a7815728C72D74B4ff4982d54Fc1
          client
            .getStorageAt({
              address: address as `0x${string}`,
              slot: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
            })
            .then((slot: any) => {
              const trimmed = trim(slot);
              console.debug("EtherscanHooks.proxy.slot", trimmed);
              if (cancelled) {
                return;
              }

              if (trimmed === "0x00") {
                // this maybe a proxy contract without any explicit function
                // e.g. Gnosis Safe Proxy
                console.debug("EtherscanHooks.proxy.safe");
                client
                  .readContract({
                    address: address as `0x${string}`,
                    abi: [
                      {
                        name: "masterCopy",
                        type: "function",
                        stateMutability: "view",
                        inputs: [],
                        outputs: [{ type: "address" }],
                      },
                    ],
                    functionName: "masterCopy",
                  })
                  .then((masterCopy) => {
                    if (!cancelled) {
                      setImplementationAddress(masterCopy);
                    }
                  })
                  .catch((e) => {
                    console.warn("EtherscanHooks.proxy.safe", e);
                    setImplementationAddress("");
                  });
              } else {
                setImplementationAddress(trimmed as `0x${string}`);
              }
            });
        } else if (ethersInterface.functions["implementation()"]) {
          // EIP-897 DelegateProxy
          // https://eips.ethereum.org/EIPS/eip-897
          // test address: 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84
          console.debug(
            "EtherscanHooks.proxy.eip897",
            address,
            ethersInterface,
          );
          client
            .readContract({
              address: address as `0x${string}`,
              abi: [
                {
                  name: "implementation",
                  type: "function",
                  stateMutability: "view",
                  inputs: [],
                  outputs: [{ type: "address" }],
                },
              ],
              functionName: "implementation",
            })
            .then((implementation) => {
              if (!cancelled) {
                setImplementationAddress(implementation);
              }
            })
            .catch((e) => {
              console.warn("EtherscanHooks.proxy.eip897", e);
              setImplementationAddress("");
            });
        }
      }
    };
    func();

    return () => {
      cancelled = true;
    };
  }, [abi, client, implementationAddress, address]);

  return {
    data: abi,
    isLoading,
    error:
      (error?.message as string) ||
      (implementationAddress === "" ? "unsupported proxy pattern" : undefined),
    isProxy: address !== implementationAddress,
  };
}

interface EtherscanContractSource {
  SourceCode: string;
  ABI: string;
  ContractName: string;
  CompilerVersion: string;
  OptimizationUsed: string;
  Runs: string;
  ConstructorArguments: string;
  EVMVersion: string;
  Library: string;
  LicenseType: string;
  Proxy: string;
  Implementation: string;
  SwarmSource: string;
}

export function useEtherscanContract(
  contract: string,
  shouldFetch: boolean = true,
) {
  const apiUrl = useEtherscanAPIUrl();
  return useSWR<[EtherscanContractSource]>(
    shouldFetch
      ? `${apiUrl}?module=contract&action=getsourcecode&address=${contract}&apikey=${API_KEY}`
      : null,
    fetcher,
  );
}
