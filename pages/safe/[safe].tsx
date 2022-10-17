/* This example requires Tailwind CSS v2.0+ */
import { CalendarIcon, ChevronRightIcon } from '@heroicons/react/solid'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/router'
import SiteNav from '../../components/SiteNav'
import { useHistoryTransactions, useQueuedTransactions } from '../../hooks/SafeHooks'
import { SafeMultisigTransaction } from '../../models/SafeTypes'

const urlOfSafeTx = (safeAddr: string, txHash: string) => `https://gnosis-safe.io/app/eth:${safeAddr}/transactions/multisig_${safeAddr}_${txHash}`

export default function SafeUI() {
    // router
    const router = useRouter();
    const { safe } = router.query;
    const safeAddress = safe as string;
    // external
    const { data: historyTxs, isLoading: historyTxsLoading } = useHistoryTransactions(safeAddress, 10, router.isReady)
    const { data: queuedTxs, isLoading: queuedTxsLoading } = useQueuedTransactions(safeAddress, historyTxs?.count, 10, historyTxs?.count !== undefined)

    const isLoading = !router.isReady || historyTxsLoading || queuedTxsLoading;

  return (
    <>
      <SiteNav pageTitle={`Safe transactions | JuiceTool`} description="Safe transactions" image="/images/unsplash_voting.jpeg" />
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {isLoading && <p>Loading...</p>}
          {!isLoading && queuedTxs.results.map((tx) => (
            <li key={tx.safeTxHash}>
              <TxCard safe={safeAddress} tx={tx} />
            </li>
          ))}
          <span className="bg-white pr-2 text-sm text-gray-500">History Transactions</span>
          {!isLoading && historyTxs.results.map((tx) => (
            <li key={tx.safeTxHash}>
              <TxCard safe={safeAddress} tx={tx} />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

function TxCard({safe, tx}: {safe: string, tx: SafeMultisigTransaction}) {

  return (
    <a href={urlOfSafeTx(safe, tx.safeTxHash)} className="block hover:bg-gray-50">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
          <div className="truncate">
            <div className="flex text-sm">
              <p className="truncate font-medium text-indigo-600">{tx.nonce}&nbsp;{tx.dataDecoded?.method || 'unknown'}</p>
              <p className="ml-1 flex-shrink-0 font-normal text-gray-500">blah</p>
            </div>
            <div className="mt-2 flex">
              <div className="flex items-center text-sm text-gray-500">
                <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                <p>
                  Submitted <time dateTime={tx.submissionDate}>{formatDistanceToNow(new Date(tx.submissionDate), { addSuffix: true })}</time>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
            <div className="flex -space-x-1 overflow-hidden">
              {tx.confirmations.map((confirmation) => (
                <img
                  key={confirmation.owner}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                  src={`https://cdn.stamp.fyi/avatar/${confirmation.owner}?s=160`}
                  alt={`avatar of ${confirmation.owner}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="ml-5 flex-shrink-0">
          <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      </div>
    </a>
  )
}