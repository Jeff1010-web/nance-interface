import { formatDistanceToNowStrict, parseISO, set } from 'date-fns';
import { useMultisigTransactions } from '../../hooks/SafeHooks';
import SearchableComboBox, { Option } from '../SearchableComboBox';
import { SafeMultisigTransactionListResponse } from '@safe-global/api-kit';
import { RevisedSafeMultisigTransactionResponse } from '../../models/SafeTypes';
import { useQueryParams, withDefault, StringParam } from 'next-query-params';
import { useEffect } from 'react';

export type TxOption = Option & { tx: RevisedSafeMultisigTransactionResponse }
export type AddressMap = { [address: string]: string }

export function SafeTransactionSelector({safeAddress, val, setVal, addressMap = {}} : {safeAddress: string, val: TxOption | undefined, setVal: (val: TxOption) => void, addressMap?: AddressMap}) {

  const [query, setQuery] = useQueryParams({
    safeTxHash: withDefault(StringParam, "")
  });

  const { data: txns, isLoading } = useMultisigTransactions(safeAddress, 20);

  const convertToOptions = (res: SafeMultisigTransactionListResponse | undefined, status: boolean) => {
    if(!res) return [];
    return res.results.map((_tx) => {
      const tx = _tx as any as RevisedSafeMultisigTransactionResponse;
      const addressLabel = addressMap[tx.to] ? `${addressMap[tx.to]}.` : '';
      return {
        id: tx.safeTxHash,
        label: `Tx ${tx.nonce} ${addressLabel}${tx.dataDecoded ? tx.dataDecoded.method : 'unknown'}`,
        extraLabel: formatDistanceToNowStrict(parseISO(tx.submissionDate), { addSuffix: true }),
        status,
        tx: tx
      };
    });
  };
  const options = convertToOptions(txns, true);

  // read safeTxHash from query and setSelected if it's not already selected
  useEffect(() => {
    if (query.safeTxHash !== "" && val?.id !== query.safeTxHash) {
      const tx = options.find(o => o.id === query.safeTxHash);
      if (tx) {
        setVal(tx);
      }
    }
  }, [query.safeTxHash, options]);

  return (
    <SearchableComboBox val={val} setVal={(v) => {
      setVal(v);
      setQuery({ safeTxHash: v?.id });
    }} options={options} label={isLoading ? "loading..." : "Load Safe Transaction"} />
  );
}