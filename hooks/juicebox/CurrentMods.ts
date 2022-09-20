import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { useProvider } from "wagmi";
import { getModStore } from "juice-sdk-v1";
import { useContractReadValue } from "./ContractReadValue";
import { PayoutModStructOutput, TicketModStructOutput } from '../../types/contracts/v1/ModStore';

export function useCurrentPayoutMods(
    projectId: BigNumberish | undefined,
    currentConfigured: BigNumberish | undefined,)  {
    const provider = useProvider();
    const contract = getModStore(provider);

    return useContractReadValue<PayoutModStructOutput>({
        contract,
        functionName: 'payoutModsOf',
        args: projectId && currentConfigured
            ? [
                BigNumber.from(projectId).toHexString(),
                BigNumber.from(currentConfigured).toHexString(),
            ]
            : null,
    })
}

export function useCurrentTicketMods(
    projectId: BigNumberish | undefined,
    currentConfigured: BigNumberish | undefined,)  {
    const provider = useProvider();
    const contract = getModStore(provider);

    return useContractReadValue<TicketModStructOutput>({
        contract,
        functionName: 'ticketModsOf',
        args: projectId && currentConfigured
            ? [
                BigNumber.from(projectId).toHexString(),
                BigNumber.from(currentConfigured).toHexString(),
            ]
            : null,
    })
}