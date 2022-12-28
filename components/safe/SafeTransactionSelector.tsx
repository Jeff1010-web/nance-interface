import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { useHistoryTransactions, useQueuedTransactions } from '../../hooks/SafeHooks';
import { SafeMultisigTransaction, SafeMultisigTransactionResponse } from '../../models/SafeTypes';
import SearchableComboBox, { Option } from '../SearchableComboBox';

export type TxOption = Option & { tx: SafeMultisigTransaction }

export type AddressMap = { [address: string]: string }

export function SafeTransactionSelector({safeAddress, val, setVal, shouldRun = true, addressMap = {}} : {safeAddress: string, val: TxOption, setVal: (val: TxOption) => void, shouldRun?: boolean, addressMap?: AddressMap}) {
    const { data: historyTxs, isLoading: historyTxsLoading } = useHistoryTransactions(safeAddress, 20, shouldRun)
    const { data: queuedTxs, isLoading: queuedTxsLoading } = useQueuedTransactions(safeAddress, historyTxs?.count, 10, historyTxs?.count !== undefined)

    const convertToOptions = (res: SafeMultisigTransactionResponse, status: boolean) => {
        if(!res) return []
        return res.results.map((tx) => {
            const addressLabel = addressMap[tx.to] ? `${addressMap[tx.to]}.` : ''
            return {
                id: tx.safeTxHash,
                label: `Tx ${tx.nonce} ${addressLabel}${tx.dataDecoded ? tx.dataDecoded.method : 'unknown'}`,
                extraLabel: formatDistanceToNowStrict(parseISO(tx.submissionDate), { addSuffix: true }),
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