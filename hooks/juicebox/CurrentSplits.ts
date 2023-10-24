import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { useContractReadValue } from "./ContractReadValue";
import { JBSplit } from '../../models/JuiceboxTypes';
import { useEthersProvider } from '../ViemAdapter';
import { NetworkContext } from '../../context/NetworkContext';
import { useContext } from 'react';
import { getJBSplitsStore } from '../../libs/JuiceboxContracts';

export function useCurrentSplits(
  projectId: BigNumberish | undefined,
  // funding cycle configuration
  domain: BigNumberish | undefined,
  // ETH_PAYOUT_SPLIT_GROUP or RESERVED_TOKEN_SPLIT_GROUP
  group: BigNumberish | undefined
) {
  const provider = useEthersProvider();
  const network = useContext(NetworkContext);
  const contract = getJBSplitsStore(provider, network);

  return useContractReadValue<JBSplit[]>({
    contract,
    functionName: 'splitsOf',
    args: projectId && domain && group
      ? [
        BigNumber.from(projectId).toHexString(),
        BigNumber.from(domain).toHexString(),
        BigNumber.from(group).toHexString()
      ]
      : null,
  });
}
