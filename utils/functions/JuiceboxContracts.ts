import { Contract } from 'ethers';

import JBController from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBController.json';
import JBController_goerli from '@jbx-protocol/juice-contracts-v3/deployments/goerli/JBController.json';
import JBController3_1 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBController3_1.json';
import JBController3_1_goerli from '@jbx-protocol/juice-contracts-v3/deployments/goerli/JBController3_1.json';

import JBDirectory from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBDirectory.json';
import JBDirectory_goerli from '@jbx-protocol/juice-contracts-v3/deployments/goerli/JBDirectory.json';

import JBSplitsStore from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBSplitsStore.json';
import JBSplitsStore_goerli from '@jbx-protocol/juice-contracts-v3/deployments/goerli/JBSplitsStore.json';

import JBFundAccessConstraintsStore from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBFundAccessConstraintsStore.json';
import JBFundAccessConstraintsStore_goerli from '@jbx-protocol/juice-contracts-v3/deployments/goerli/JBFundAccessConstraintsStore.json';

import JBSingleTokenPaymentTerminalStore from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBSingleTokenPaymentTerminalStore.json';
import JBSingleTokenPaymentTerminalStore_goerli from '@jbx-protocol/juice-contracts-v3/deployments/goerli/JBSingleTokenPaymentTerminalStore.json';

import JBETHPaymentTerminal from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBETHPaymentTerminal.json';
import JBETHPaymentTerminal3_1 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBETHPaymentTerminal3_1.json';
import JBETHPaymentTerminal3_1_1 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBETHPaymentTerminal3_1_1.json';
import JBETHPaymentTerminal3_1_2 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBETHPaymentTerminal3_1_2.json';
import JBETHPaymentTerminal_goerli from '@jbx-protocol/juice-contracts-v3/deployments/goerli/JBETHPaymentTerminal.json';
import JBETHPaymentTerminal3_1_goerli from '@jbx-protocol/juice-contracts-v3/deployments/goerli/JBETHPaymentTerminal3_1.json';
import JBETHPaymentTerminal3_1_1_goerli from '@jbx-protocol/juice-contracts-v3/deployments/goerli/JBETHPaymentTerminal3_1_1.json';
import JBETHPaymentTerminal3_1_2_goerli from '@jbx-protocol/juice-contracts-v3/deployments/goerli/JBETHPaymentTerminal3_1_2.json';
import { goerli } from 'wagmi/chains';

export function getJBControllerVersion(address: string | undefined) {
  if (address === JBController.address) {
    return "v3";
  } else if (address === JBController3_1.address) {
    return "v3.1";
  } else if (address === JBController_goerli.address) {
    return "v3";
  } else if (address === JBController3_1_goerli.address) {
    return "v3.1";
  }
}

export function getJBController(provider: any, _version: string | undefined, _network: string | undefined) {
  const version = _version === "v3" ? "v3" : "v3.1";
  const network = _network === goerli.name ? "goerli" : "mainnet";

  if (network === "mainnet") {
    if (version === "v3.1") {
      return new Contract(JBController3_1.address, JBController3_1.abi, provider);
    } else if (version === "v3") {
      return new Contract(JBController.address, JBController.abi, provider);
    }
  }

  if (network === "goerli") {
    if (version === "v3.1") {
      return new Contract(JBController3_1_goerli.address, JBController3_1_goerli.abi, provider);
    } else if (version === "v3") {
      return new Contract(JBController_goerli.address, JBController_goerli.abi, provider);
    }
  }
}

export function getJBDirectory(provider: any, _network: string | undefined) {
  const network = _network === goerli.name ? "goerli" : "mainnet";

  if (network === "mainnet") {
    return new Contract(JBDirectory.address, JBDirectory.abi, provider);
  }

  if (network === "goerli") {
    return new Contract(JBDirectory_goerli.address, JBDirectory_goerli.abi, provider);
  }
}

export function getJBSplitsStore(provider: any, _network: string | undefined) {
  const network = _network === goerli.name ? "goerli" : "mainnet";

  if (network === "mainnet") {
    return new Contract(JBSplitsStore.address, JBSplitsStore.abi, provider);
  }

  if (network === "goerli") {
    return new Contract(JBSplitsStore_goerli.address, JBSplitsStore_goerli.abi, provider);
  }
}

export function getJBFundAccessConstraintsStore(provider: any, _network: string | undefined) {
  const network = _network === goerli.name ? "goerli" : "mainnet";

  if (network === "mainnet") {
    return new Contract(JBFundAccessConstraintsStore.address, JBFundAccessConstraintsStore.abi, provider);
  }

  if (network === "goerli") {
    return new Contract(JBFundAccessConstraintsStore_goerli.address, JBFundAccessConstraintsStore_goerli.abi, provider);
  }
}

export function getJBSingleTokenPaymentTerminalStore(provider: any, _network: string | undefined) {
  const network = _network === goerli.name ? "goerli" : "mainnet";

  if (network === "mainnet") {
    return new Contract(JBSingleTokenPaymentTerminalStore.address, JBSingleTokenPaymentTerminalStore.abi, provider);
  }

  if (network === "goerli") {
    return new Contract(JBSingleTokenPaymentTerminalStore_goerli.address, JBSingleTokenPaymentTerminalStore_goerli.abi, provider);
  }
}

export function getJBETHPaymentTerminal(provider: any, _network: string | undefined, address: string | undefined) {
  const network = _network === goerli.name ? "goerli" : "mainnet";

  if (network === "mainnet") {
    if (address === JBETHPaymentTerminal.address) {
      return new Contract(JBETHPaymentTerminal.address, JBETHPaymentTerminal.abi, provider);
    } else if (address === JBETHPaymentTerminal3_1.address) {
      return new Contract(JBETHPaymentTerminal3_1.address, JBETHPaymentTerminal3_1.abi, provider);
    } else if (address === JBETHPaymentTerminal3_1_1.address) {
      return new Contract(JBETHPaymentTerminal3_1_1.address, JBETHPaymentTerminal3_1_1.abi, provider);
    } else {
      return new Contract(JBETHPaymentTerminal3_1_2.address, JBETHPaymentTerminal3_1_2.abi, provider);
    }
  }

  if (network === "goerli") {
    if (address === JBETHPaymentTerminal_goerli.address) {
      return new Contract(JBETHPaymentTerminal_goerli.address, JBETHPaymentTerminal_goerli.abi, provider);
    } else if (address === JBETHPaymentTerminal3_1_goerli.address) {
      return new Contract(JBETHPaymentTerminal3_1_goerli.address, JBETHPaymentTerminal3_1_goerli.abi, provider);
    } else if (address === JBETHPaymentTerminal3_1_1_goerli.address) {
      return new Contract(JBETHPaymentTerminal3_1_1_goerli.address, JBETHPaymentTerminal3_1_1_goerli.abi, provider);
    } else {
      return new Contract(JBETHPaymentTerminal3_1_2_goerli.address, JBETHPaymentTerminal3_1_2_goerli.abi, provider);
    }
  }
}
