import { useContractReadValue } from './ContractReadValue';
import { BigNumberish } from '@ethersproject/bignumber';
import { useEthersProvider } from '../ViemAdapter';
import { NetworkContext } from '../../../context/NetworkContext';
import { useContext } from 'react';
import { getJBController, getJBControllerVersion, getJBDirectory } from '../../functions/JuiceboxContracts';

export default function useControllerOfProject(
  projectId: BigNumberish | undefined
) {
  const provider = useEthersProvider();
  const network = useContext(NetworkContext);
  const directory = getJBDirectory(provider, network);

  const { value, loading, refetchValue } = useContractReadValue<string>({
    contract: directory,
    functionName: 'controllerOf',
    args: projectId ? [projectId] : null
  });

  const version = getJBControllerVersion(value);
  const contract = getJBController(provider, version, network);

  return {
    value: contract,
    loading, refetchValue,
    version
  }
}
