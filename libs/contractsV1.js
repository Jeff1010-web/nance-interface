import FundingCycles from '@jbx-protocol/contracts-v1/deployments/mainnet/FundingCycles.json';
import ModStore from '@jbx-protocol/contracts-v1/deployments/mainnet/ModStore.json';
import Projects from '@jbx-protocol/contracts-v1/deployments/mainnet/Projects.json';

export const FundingCycleContract = {
    addressOrName: FundingCycles.address,
    contractInterface: FundingCycles.abi
}

export const ModStoreContract = {
    addressOrName: ModStore.address,
    contractInterface: ModStore.abi
}

export const ProjectsContract = {
    addressOrName: Projects.address,
    contractInterface: Projects.abi
}