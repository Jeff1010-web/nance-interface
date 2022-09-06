/* This example requires Tailwind CSS v2.0+ */
import { CalendarIcon, ChevronRightIcon } from '@heroicons/react/solid'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import SiteNav from '../../components/SiteNav'


interface SafeTx {
    nonce: number
    origin: string
    data?: string
    dataDecoded?: {
        method: string
        parameters: object[]
    }
    isExecuted: boolean
    safeTxHash: string
    submissionDate: string
    executionDate: string
    confirmations?: {
        owner: string
        submissionDate: string
        transactionHash: string
        signature: string
        signatureType: string
    }[]
}

const urlOfHistoryTxs = (safeAddress: string, limit: number = 10) => `https://safe-transaction.gnosis.io/api/v1/safes/${safeAddress}/multisig-transactions/?executed=true&trusted=true&limit=${limit}`
const urlOfQueuedTxs = (safeAddress: string, currentNonce: number, limit: number = 10) => `https://safe-transaction.gnosis.io/api/v1/safes/${safeAddress}/multisig-transactions/?nonce__gte=${currentNonce}&trusted=true&limit=${limit}`
const urlOfSafeTx = (safeAddr: string, txHash: string) => `https://gnosis-safe.io/app/eth:${safeAddr}/transactions/multisig_${safeAddr}_${txHash}`

export default function SafeUI() {
    // router
    const router = useRouter();
    const { safe } = router.query;
    const safeAddress = safe as string;
    // state
    const [queuedTxs, setQueuedTxs] = useState(null)
    const [historyTxs, setHistoryTxs] = useState(null)
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
      if(!router.isReady) return;
      setLoading(true)
      fetch(urlOfHistoryTxs(safeAddress))
        .then((res) => res.json())
        .then((data) => {
          console.info('📗 SafeUI.historyTxs >', {data})
          setHistoryTxs(data)
          fetch(urlOfQueuedTxs(safeAddress, data.count))
            .then((res) => res.json())
            .then((data) => {
              console.info('📗 SafeUI.queuedTxs >', {data})
              setQueuedTxs(data)
              setLoading(false)
            })
        })
    }, [router.isReady])

  return (
    <>
      <SiteNav pageTitle={`Safe transactions | JuiceTool`} currentIndex={6} description="Safe transactions" image="/images/unsplash_voting.jpeg" />
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {isLoading && <p>Loading...</p>}
          {!isLoading && queuedTxs.results.map((tx: SafeTx) => (
            <li key={tx.nonce}>
              <TxCard safe={safeAddress} tx={tx} />
            </li>
          ))}
          <span className="bg-white pr-2 text-sm text-gray-500">History Transactions</span>
          {!isLoading && historyTxs.results.map((tx: SafeTx) => (
            <li key={tx.nonce}>
              <TxCard safe={safeAddress} tx={tx} />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

function TxCard({safe, tx}: {safe: string, tx: SafeTx}) {

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