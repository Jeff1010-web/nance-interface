import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { useProvider } from "wagmi";
import { getJBController, getJBETHPaymentTerminal } from "juice-sdk";
import { useContractReadValue } from "./ContractReadValue";

const ETH_TOKEN_ADDRESS = '0x000000000000000000000000000000000000eeee'

export function useDistributionLimit(
    projectId: BigNumberish | undefined,
    configured: BigNumberish | undefined,
)  {
    const provider = useProvider();
    const contract = getJBController(provider);
    const terminal = getJBETHPaymentTerminal(provider);

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