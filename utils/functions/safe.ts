export function getSafeTxUrl(address: string, hash: string) {
  return `https://app.safe.global/transactions/tx?safe=eth:${address}&id=multisig_${address}_${hash}`;
}
