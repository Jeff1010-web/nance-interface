import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { useContractReadValue } from "./ContractReadValue";
import { useEthersProvider } from '../ViemAdapter';
import useControllerOfProject from './ControllerOfProject';
import useTerminalOfProject from './TerminalOfProject';
import { useContext } from 'react';
import { NetworkContext } from '../../context/NetworkContext';
import { getJBFundAccessConstraintsStore } from '../../libs/JuiceboxContracts';

const ETH_TOKEN_ADDRESS = '0x000000000000000000000000000000000000eeee';

export function useDistributionLimit(
  projectId: BigNumberish | undefined,
  configured: BigNumberish | undefined
) {
  const provider = useEthersProvider();
  const network = useContext(NetworkContext);
  const { value: controller, version } = useControllerOfProject(projectId);
  const { value: terminal } = useTerminalOfProject(projectId)

  // v3_1 introduced JBFundAccessConstraintsStore, which should be used instead of JB controller.
  const contract =
    version === "v3.1"
      ? getJBFundAccessConstraintsStore(provider, network)
      : controller;

  return useContractReadValue<[BigNumber, BigNumber]>({
    contract,
    functionName: 'distributionLimitOf',
    args: projectId && configured && terminal?.address
      ? [
        BigNumber.from(projectId).toHexString(),
        BigNumber.from(configured).toHexString(),
        terminal.address,
        ETH_TOKEN_ADDRESS
      ]
      : null,
  });
}
