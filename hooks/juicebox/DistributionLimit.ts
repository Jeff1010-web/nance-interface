import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { useProvider, useContract } from "wagmi";
import { getJBController, getJBETHPaymentTerminal } from "juice-sdk";
import { useContractReadValue } from "./ContractReadValue";
import JBControllerV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBController.json';
import JBETHPaymentTerminalV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBETHPaymentTerminal.json';

const ETH_TOKEN_ADDRESS = '0x000000000000000000000000000000000000eeee'

export function useDistributionLimit(
    projectId: BigNumberish | undefined,
    configured: BigNumberish | undefined,
    isV3: boolean = false
)  {
    const provider = useProvider();
    const contract = isV3 ? 
        useContract({address: JBControllerV3.address, abi: JBControllerV3.abi, signerOrProvider: provider}) 
        : getJBController(provider);
    const terminal = isV3 ?
        useContract({address: JBETHPaymentTerminalV3.address, abi: JBETHPaymentTerminalV3.abi, signerOrProvider: provider})
        : getJBETHPaymentTerminal(provider);

    return useContractReadValue<[BigNumber, BigNumber]>({
        contract,
        functionName: 'distributionLimitOf',
        args: projectId && configured && terminal?.address
            ? [
                BigNumber.from(projectId).toHexString(),
                BigNumber.from(configured).toHexString(),
                terminal.address,
                ETH_TOKEN_ADDRESS
            ]
            : null,
    })
}