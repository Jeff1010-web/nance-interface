import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { getJBSplitsStore } from "juice-sdk";
import { useContractReadValue } from "./ContractReadValue";
import { JBSplit } from '../../models/JuiceboxTypes';
import JBSplitsStoreV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBSplitsStore.json';
import { Contract } from 'ethers';
import { useEthersProvider } from '../ViemAdapter';

export function useCurrentSplits(
  projectId: BigNumberish | undefined,
  // funding cycle configuration
  domain: BigNumberish | undefined,
  // ETH_PAYOUT_SPLIT_GROUP or RESERVED_TOKEN_SPLIT_GROUP
  group: BigNumberish | undefined,
  isV3: boolean = false
)  {
  const provider = useEthersProvider();
  const contract = isV3 ? 
    new Contract(JBSplitsStoreV3.address, JBSplitsStoreV3.abi, provider)
    : getJBSplitsStore(provider);

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