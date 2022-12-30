import { useContract, useProvider } from 'wagmi';
import { getTicketBooth } from 'juice-sdk-v1';
import { getJBTokenStore } from 'juice-sdk';
import JBTokenStoreV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBTokenStore.json';
import { useContractReadValue } from './ContractReadValue';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

export default function useTotalSupplyOfProject({
  projectId, version
}: {
  projectId: BigNumberish | undefined,
  version: 1 | 2 | 3
}) {
    const provider = useProvider();
    let contract;
    if (version === 1) {
        contract = getTicketBooth(provider);
    } else if (version === 2) {
        contract = getJBTokenStore(provider);
    } else if (version === 3) {
        contract = useContract({ address: JBTokenStoreV3.address, abi: JBTokenStoreV3.abi });
    }

    return useContractReadValue<BigNumber>({
        contract,
        functionName: 'totalSupplyOf',
        args: projectId ? [BigNumber.from(projectId).toHexString()] : null
    });
}