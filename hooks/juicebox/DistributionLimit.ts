import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { getJBController, getJBETHPaymentTerminal } from "juice-sdk";
import { useContractReadValue } from "./ContractReadValue";
import JBFundAccessConstraintsStore from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBFundAccessConstraintsStore.json';
import JBETHPaymentTerminalV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBETHPaymentTerminal3_1_1.json';
import { useEthersProvider } from '../ViemAdapter';
import { Contract } from 'ethers';

const ETH_TOKEN_ADDRESS = '0x000000000000000000000000000000000000eeee';

export function useDistributionLimit(
  projectId: BigNumberish | undefined,
  configured: BigNumberish | undefined,
  isV3: boolean = false
)  {
  const provider = useEthersProvider();
  const contract = isV3 ? 
    new Contract(JBFundAccessConstraintsStore.address, JBFundAccessConstraintsStore.abi, provider)
    : getJBController(provider);
  const terminal = isV3 ?
    new Contract(JBETHPaymentTerminalV3.address, JBETHPaymentTerminalV3.abi, provider)
    : getJBETHPaymentTerminal(provider);

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