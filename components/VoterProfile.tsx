import useSWR, { Fetcher } from 'swr'
import { ProfileResponse } from '../pages/api/profile';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useClearDelegate, useDelegated, useSetDelegate } from '../hooks/snapshot/Delegations';

interface VoterProfileProps {
  voter: string
  space: string
  proposal: string
  isOpen: boolean
}

const fetcher: Fetcher<ProfileResponse, VoterProfileProps & { url: string }> = async ({ url, voter, space, proposal }) => {
  const res = await fetch(url + new URLSearchParams({ voter, space, proposal }))
  const json = await res.json()
  if (res.status !== 200) {
    throw new Error(`An error occurred while fetching the data: ${json?.err}`)
  }
  return json
}

// avatar, voting power, votes cast, delegate function
export default function VoterProfile({ voter, space, proposal, isOpen }: VoterProfileProps) {
  const [shouldFetch, setShouldFetch] = useState<boolean>(false)
  const { data, error, isLoading } = useSWR(shouldFetch ? { url: '/api/profile?', voter, space, proposal } : null, fetcher)

  // only query api if the parameter hasn't been changed for 1s
  // to prevent sending many requests while user scrolling over
  useEffect(() => {
    if (isOpen) {
      setShouldFetch(false)
      const timer = setTimeout(() => {
        setShouldFetch(true)
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [voter, space, proposal, isOpen])

  if (error) {
    console.debug("❎VoterProfile.api", { voter, space, proposal, error })
    return (
      <div />
    )
  } else if (voter && isLoading) {
    // skeleton loader
    return (
      <div className="mt-1 flex justify-between items-center space-x-2 animate-pulse">
        {/* Avatar */}
        <div className='justify-center hidden lg:flex'>
          <img className="rounded-full bg-slate-200 h-10 w-10 p-1" />
        </div>

        {/* Stats */}
        <div className='flex space-x-1'>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div className="rounded-full bg-slate-200 h-2"></div>

          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <div className="rounded-full bg-slate-200 h-2"></div>
        </div>

        {/* Delegate */}
        <button className={BUTTON_STYLE}>
        </button>
      </div>
    )
  } else if (isOpen && voter && data) {
    return (
      <div className="mt-1 flex justify-between items-center space-x-2">
        {/* Avatar */}
        <div className='justify-center hidden lg:flex'>
          <a href={`/u/${voter}`} target="_blank" rel="noreferrer">
            <img src={`https://cdn.stamp.fyi/avatar/${voter}`} className="rounded-full h-10 w-10 p-1" />
          </a>
        </div>

        {/* Stats */}
        <div className='flex space-x-1'>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>
            {1 + data.delegators.length ?? 0}
          </span>

          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span>
            {data.votes.total ?? 0}
          </span>
        </div>

        {/* Delegate */}
        <DelegateActions delegate={voter} />
      </div>
    )
  } else {
    return (
      <div />
    )
  }
}

const BUTTON_STYLE = "w-fit m-2 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-2 py-1 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"

function DelegateActions({ delegate }: { delegate: string }) {
  const { address, isConnecting, isDisconnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { data: delegatedAddress } = useDelegated('jbdao.eth', address)

  // Wallet: connecting / not connected
  // Delegate: delegate / undelegate
  if (isConnecting) {
    return (
      <button disabled className={BUTTON_STYLE}>
        Connecting
      </button>
    )
  } else if (!address) {
    return (
      <button onClick={() => openConnectModal()}
        className={BUTTON_STYLE}>
        Connect Wallet
      </button>
    )
  } else if (address === delegate) {
    return null
  } else if (delegatedAddress === delegate) {
    return <ClearDelegateButton />
  } else {
    return <SetDelegateButton delegate={delegate} />
  }

}

function SetDelegateButton({ delegate }: { delegate: string }) {
  const { data, isLoading, isSuccess, write, error } = useSetDelegate('jbdao.eth', delegate)

  console.debug("SetButton", { data, isLoading, write, error })

  let label = "Delegate"
  if (error) {
    label = "Error"
    console.debug("SetDelegate", { error })
  } else if (isLoading) {
    label = "Check Wallet"
  } else if (!write) {
    label = "Preparing"
  }

  return (
    <button disabled={!write || error !== null || isLoading} onClick={() => write?.()}
      className={BUTTON_STYLE}>
      {label}
    </button>
  )
}

function ClearDelegateButton() {
  const { data, isLoading, isSuccess, write, error } = useClearDelegate('jbdao.eth')

  let label = "Undelegate"
  if (error) {
    label = "Error"
    console.debug("SetDelegate", { error })
  } else if (isLoading) {
    label = "Check Wallet"
  } else if (!write) {
    label = "Preparing"
  }

  return (
    <button disabled={!write || error !== null || isLoading} onClick={() => write?.()}
      className={BUTTON_STYLE}>
      {label}
    </button>
  )
}
