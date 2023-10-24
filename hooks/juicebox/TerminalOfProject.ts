import { useContractReadValue } from './ContractReadValue';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { useEthersProvider } from '../ViemAdapter';
import { ETH_TOKEN_ADDRESS } from '../../models/JuiceboxTypes';
import { useContext } from 'react';
import { NetworkContext } from '../../context/NetworkContext';
import { getJBDirectory, getJBETHPaymentTerminal } from '../../libs/JuiceboxContracts';

export default function useTerminalOfProject(
  projectId: BigNumberish | undefined
) {
  const provider = useEthersProvider();
  const network = useContext(NetworkContext);
  const contract = getJBDirectory(provider, network);

  const { value, refetchValue, loading } = useContractReadValue<string>({
    contract,
    functionName: 'primaryTerminalOf',
    args: projectId ? [BigNumber.from(projectId).toHexString(), ETH_TOKEN_ADDRESS] : null
  });

  const terminal = getJBETHPaymentTerminal(provider, network, value);

  return {
    value: terminal, refetchValue, loading
  }
}
