import { erc20ABI } from 'wagmi';
import { getTicketBooth } from 'juice-sdk-v1';
import { getJBTokenStore } from 'juice-sdk';
import { useContractReadValue } from './ContractReadValue';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { invalidateZeroAddress } from '../../libs/address';
import { useEthersProvider } from '../ViemAdapter';
import { Contract } from 'ethers';

export function useTokenAddressOfProject(version: number, projectId: BigNumberish | undefined) {
  const provider = useEthersProvider();
  // FIXME support version 3
  const contract = version == 2 ? getJBTokenStore(provider) : getTicketBooth(provider);

  return useContractReadValue<string>({
    contract,
    functionName: version == 2 ? 'tokenOf' : 'ticketsOf',
    args: projectId ? [BigNumber.from(projectId).toHexString()] : null
  });
}

export function useSymbolOfERC20(tokenAddress: string | undefined) {
  const provider = useEthersProvider();
  let contract = new Contract(
    invalidateZeroAddress(tokenAddress), 
    erc20ABI,
    provider
  )

  return useContractReadValue<string>({
    contract,
    functionName: 'symbol',
    args: undefined
  });
}