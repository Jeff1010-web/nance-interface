import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { useProvider } from "wagmi";
import { getJBSplitsStore } from "juice-sdk";
import { useContractReadValue } from "./ContractReadValue";
import { Split } from '../../models/JuiceboxTypes';

export function useCurrentSplits(
    projectId: BigNumberish | undefined,
    // funding cycle configuration
    domain: BigNumberish | undefined,
    // ETH_PAYOUT_SPLIT_GROUP or RESERVED_TOKEN_SPLIT_GROUP
    group: BigNumberish | undefined
)  {
    const provider = useProvider();
    const contract = getJBSplitsStore(provider);

    return useContractReadValue<Split[]>({
        contract,
        functionName: 'splitsOf',
        args: projectId && domain && group
            ? [
                BigNumber.from(projectId).toHexString(),
                BigNumber.from(domain).toHexString(),
                BigNumber.from(group).toHexString()
            ]
            : null,
    })
}