import { getTicketBooth } from 'juice-sdk-v1';
import { getJBTokenStore } from 'juice-sdk';
import JBTokenStoreV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBTokenStore.json';
import { useContractReadValue } from './ContractReadValue';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { useEthersProvider } from '../ViemAdapter';
import { Contract } from 'ethers';

export function useTotalSupplyOfProject({
  projectId, version
}: {
  projectId: BigNumberish | undefined,
  version: 1 | 2 | 3
}) {
  const provider = useEthersProvider();
  let contract;
  if (version === 1) {
    contract = getTicketBooth(provider);
  } else if (version === 2) {
    contract = getJBTokenStore(provider);
  } else if (version === 3) {
    contract = new Contract(JBTokenStoreV3.address, JBTokenStoreV3.abi, provider);
  }

  return useContractReadValue<BigNumber>({
    contract,
    functionName: 'totalSupplyOf',
    args: projectId ? [BigNumber.from(projectId).toHexString()] : null
  });
}

export function useTokenBalanceOfProject({
  holder, projectId, version
}: {
  holder: string
  projectId: BigNumberish | undefined,
  version: 1 | 2 | 3
}) {
  const provider = useEthersProvider();
  let contract;
  if (version === 1) {
    contract = getTicketBooth(provider);
  } else if (version === 2) {
    contract = getJBTokenStore(provider);
  } else if (version === 3) {
    contract = new Contract(JBTokenStoreV3.address, JBTokenStoreV3.abi, provider);
  }

  return useContractReadValue<BigNumber>({
    contract,
    functionName: 'balanceOf',
    args: holder && projectId ? [holder, BigNumber.from(projectId).toHexString()] : null
  });
}
