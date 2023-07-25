// All properties on a domain are optional
export const DOMAIN = {
  name: 'JBDAO',
  version: '1',
  chainId: 1,
  //verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
};

// The named list of all type definitions
export const TYPES = {
  APIPayload: [
    { name: 'path', type: 'string' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'payload', type: 'string' },
  ],
};