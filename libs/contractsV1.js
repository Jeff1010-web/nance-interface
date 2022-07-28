import FundingCycles from '@jbx-protocol/contracts-v1/deployments/mainnet/FundingCycles.json';
import ModStore from '@jbx-protocol/contracts-v1/deployments/mainnet/ModStore.json';
import Projects from '@jbx-protocol/contracts-v1/deployments/mainnet/Projects.json';
import TerminalV1 from '@jbx-protocol/contracts-v1/deployments/mainnet/TerminalV1.json';

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

export const TerminalV1Contract = {
    addressOrName: TerminalV1.address,
    contractInterface: TerminalV1.abi
}