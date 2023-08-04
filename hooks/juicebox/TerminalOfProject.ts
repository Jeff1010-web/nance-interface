import { getTerminalDirectory } from 'juice-sdk-v1';
import { useContractReadValue } from './ContractReadValue';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { useEthersProvider } from '../ViemAdapter';
import JBDirectory from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBDirectory.json';
import { Contract } from 'ethers';
import { ETH_TOKEN_ADDRESS } from '../../models/JuiceboxTypes';
import JBETHPaymentTerminal from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBETHPaymentTerminal.json';
import JBETHPaymentTerminal3_1 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBETHPaymentTerminal3_1.json';
import JBETHPaymentTerminal3_1_1 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBETHPaymentTerminal3_1_1.json';

export default function useTerminalOfProject(
  projectId: BigNumberish | undefined
) {
  const provider = useEthersProvider();
  const contract = new Contract(JBDirectory.address, JBDirectory.abi, provider);

  const { value, refetchValue, loading } = useContractReadValue<string>({
    contract,
    functionName: 'primaryTerminalOf',
    args: projectId ? [BigNumber.from(projectId).toHexString(), ETH_TOKEN_ADDRESS] : null
  });

  let terminal;
  if (value === JBETHPaymentTerminal.address) {
    terminal = new Contract(JBETHPaymentTerminal.address, JBETHPaymentTerminal.abi, provider);
  } else if (value === JBETHPaymentTerminal3_1.address) {
    terminal = new Contract(JBETHPaymentTerminal3_1.address, JBETHPaymentTerminal3_1.abi, provider);
  } else {
    //if (value === JBETHPaymentTerminal3_1_1.address) {
    terminal = new Contract(JBETHPaymentTerminal3_1_1.address, JBETHPaymentTerminal3_1_1.abi, provider);
  } 

  return {
    value: terminal, refetchValue, loading
  }
}