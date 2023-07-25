import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { getModStore } from "juice-sdk-v1";
import { useContractReadValue } from "./ContractReadValue";
import { PayoutModV1, TicketModV1 } from '../../models/JuiceboxTypes';
import { useEthersProvider } from '../ViemAdapter';

export function useCurrentPayoutMods(
  projectId: BigNumberish | undefined,
  currentConfigured: BigNumberish | undefined,)  {
  const provider = useEthersProvider();
  const contract = getModStore(provider);

  return useContractReadValue<PayoutModV1[]>({
    contract,
    functionName: 'payoutModsOf',
    args: projectId && currentConfigured
      ? [
        BigNumber.from(projectId).toHexString(),
        BigNumber.from(currentConfigured).toHexString(),
      ]
      : null,
  });
}

export function useCurrentTicketMods(
  projectId: BigNumberish | undefined,
  currentConfigured: BigNumberish | undefined,)  {
  const provider = useEthersProvider();
  const contract = getModStore(provider);

  return useContractReadValue<TicketModV1[]>({
    contract,
    functionName: 'ticketModsOf',
    args: projectId && currentConfigured
      ? [
        BigNumber.from(projectId).toHexString(),
        BigNumber.from(currentConfigured).toHexString(),
      ]
      : null,
  });
}