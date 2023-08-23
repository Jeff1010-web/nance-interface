import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { useContractReadValue } from "./ContractReadValue";
import JBFundAccessConstraintsStore from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBFundAccessConstraintsStore.json';
import { useEthersProvider } from '../ViemAdapter';
import { Contract } from 'ethers';
import useControllerOfProject from './ControllerOfProject';
import useTerminalOfProject from './TerminalOfProject';

const ETH_TOKEN_ADDRESS = '0x000000000000000000000000000000000000eeee';

export function useDistributionLimit(
  projectId: BigNumberish | undefined,
  configured: BigNumberish | undefined
)  {
  const provider = useEthersProvider();
  const { value: controller, version } = useControllerOfProject(projectId);
  const { value: terminal } = useTerminalOfProject(projectId)

  // v3_1 introduced JBFundAccessConstraintsStore, which should be used instead of JB controller.
  const contract =
    version === "v3.1"
      ? new Contract(JBFundAccessConstraintsStore.address, JBFundAccessConstraintsStore.abi, provider)
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