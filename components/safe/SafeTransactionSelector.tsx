import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { useQueuedTransactions } from '../../hooks/SafeHooks';
import SearchableComboBox, { Option } from '../SearchableComboBox';
import { SafeMultisigTransactionListResponse } from '@safe-global/api-kit';
import { RevisedSafeMultisigTransactionResponse } from '../../models/SafeTypes';

export type TxOption = Option & { tx: RevisedSafeMultisigTransactionResponse }
export type AddressMap = { [address: string]: string }

export function SafeTransactionSelector({safeAddress, val, setVal, shouldRun = true, addressMap = {}} : {safeAddress: string, val: TxOption | undefined, setVal: (val: TxOption) => void, shouldRun?: boolean, addressMap?: AddressMap}) {
  //const { value: historyTxs, loading: historyTxsLoading } = useHistoryTransactions(safeAddress, shouldRun);
  const { value: queuedTxs, loading: queuedTxsLoading } = useQueuedTransactions(safeAddress);

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
  const options = convertToOptions(queuedTxs, true);

  return (
    <SearchableComboBox val={val} setVal={setVal} options={options} label="Load Safe Transaction" />
  );
}