export function shortenAddress(address: string) {
    if(address?.length !== 42) {
      return address;
    }
    
    return address.substring(0, 6) + '...' + address.substring(address.length - 4)
}

export function invalidateZeroAddress(address: string) {
    if (address == '0x0000000000000000000000000000000000000000') {
      return undefined;
    }
    return address;
}