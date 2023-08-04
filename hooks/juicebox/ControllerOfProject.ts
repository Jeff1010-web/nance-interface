import { getTerminalDirectory } from 'juice-sdk-v1';
import { useContractReadValue } from './ContractReadValue';
import { BigNumberish } from '@ethersproject/bignumber';
import { useEthersProvider } from '../ViemAdapter';
import JBDirectory from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBDirectory.json';
import { Contract } from 'ethers';
import JBController from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBController.json';
import JBController3_1 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBController3_1.json';

export default function useControllerOfProject(
  projectId: BigNumberish | undefined
) {
  const provider = useEthersProvider();
  const directory = new Contract(JBDirectory.address, JBDirectory.abi, provider);

  const { value, loading, refetchValue } = useContractReadValue<string>({
    contract: directory,
    functionName: 'controllerOf',
    args: projectId ? [projectId] : null
  });

  let version;
  let contract;
  if (value === JBController.address) {
    version = "v3";
    contract = new Contract(JBController.address, JBController.abi, provider);
  } else if (value === JBController3_1.address) {
    version = "v3.1";
    contract = new Contract(JBController3_1.address, JBController3_1.abi, provider);
  }
  
  return {
    value: contract, 
    loading, refetchValue,
    version
  }
}