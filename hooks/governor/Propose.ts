import { useContractWrite, usePrepareContractWrite } from "wagmi"

export default function usePropose(governorAddress: `0x${string}` | undefined, targets: `0x${string}`[], values: string[], calldatas: string[], description: string) {
  const { config } = usePrepareContractWrite({
    address: governorAddress,
    abi: [
      {
        inputs: [
          { internalType: "address[]", name: "targets", type: "address[]" },
          { internalType: "uint256[]", name: "values", type: "uint256[]" },
          { internalType: "bytes[]", name: "calldatas", type: "bytes[]" },
          { internalType: "string", name: "description", type: "string" }
        ],
        name: "propose",
        outputs: [
          { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        stateMutability: "nonpayable",
        type: "function"
      }
    ],
    functionName: "propose",
    args: [
      targets, values, calldatas, description
    ]
  })
  return useContractWrite(config)
}
