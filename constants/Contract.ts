export const CONTRACT_MAP = {
  "ETH": "0x0000000000000000000000000000000000000000",
  "JBX": "0x4554CC10898f92D45378b98D6D6c2dD54c687Fb2",
  "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
};

export function getContractLabel(address: string) {
  if(CONTRACT_MAP.ETH === address) return "ETH";
  else if(CONTRACT_MAP.JBX === address) return "JBX";
  else if(CONTRACT_MAP.USDC === address) return "USDC";
  else if(address === "0x8250e3cE89c8C380449de876882F5EDAA6EF44c7") return "GGG NFT";
  else if(address === "0xAabC2A962301b75F691AfF5dcc6d31A255c037A5") return "TEST NFT";
  else return `Unknown(${address})`;
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";