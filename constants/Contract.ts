export const CONTRACT_MAP = {
  "ETH": "0x0000000000000000000000000000000000000000",
  "JBX": "0x4554CC10898f92D45378b98D6D6c2dD54c687Fb2",
  "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
};

export function getContractLabel(address: string) {
  if(CONTRACT_MAP.ETH === address) return "ETH";
  else if(CONTRACT_MAP.JBX === address) return "JBX";
  else if(CONTRACT_MAP.USDC === address) return "USDC";
  else return `Unknown(${address})`;
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";