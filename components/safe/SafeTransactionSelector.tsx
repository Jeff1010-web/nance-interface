import { useHistoryTransactions, useQueuedTransactions } from '../../hooks/SafeHooks';
import { SafeMultisigTransaction, SafeMultisigTransactionResponse } from '../../models/SafeTypes';
import SearchableComboBox, { Option } from '../SearchableComboBox';

type TxOption = Option & { tx: SafeMultisigTransaction }

export function SafeTransactionSelector({safeAddress, val, setVal, shouldRun = true} : {safeAddress: string, val: TxOption, setVal: (val: TxOption) => void, shouldRun?: boolean}) {
    const { data: historyTxs, isLoading: historyTxsLoading } = useHistoryTransactions(safeAddress, 10, shouldRun)
    const { data: queuedTxs, isLoading: queuedTxsLoading } = useQueuedTransactions(safeAddress, historyTxs?.count, 10, historyTxs?.count !== undefined)

    const convertToOptions = (res: SafeMultisigTransactionResponse, status: boolean) => {
        if(!res) return []
        return res.results.map((tx) => {
            return {
                id: tx.safeTxHash,
                label: `Tx ${tx.nonce} ${tx.dataDecoded ? tx.dataDecoded.method : 'unknown'} -- ${tx.submissionDate}`,
                status,
                tx: tx
            }
        })
    }
    const options = convertToOptions(queuedTxs, true).concat(convertToOptions(historyTxs, false))

    return (
        <SearchableComboBox val={val} setVal={setVal} options={options} label="Load Safe Transaction" />
    )
}