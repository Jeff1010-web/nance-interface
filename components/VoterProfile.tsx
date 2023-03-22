import useSWR, { Fetcher } from 'swr'
import { ProfileResponse } from '../pages/api/profile';
import FormattedAddress from './FormattedAddress';
import { useEffect, useState } from 'react';

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact", compactDisplay: "short" });
const formatNumber = (num) => formatter.format(num);

interface VoterProfileProps {
  voter: string
  space: string
  proposal: string
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
export default function VoterProfile({ voter, space, proposal }: VoterProfileProps) {
  const [shouldFetch, setShouldFetch] = useState<boolean>(false)
  const { data, error, isLoading } = useSWR(shouldFetch ? { url: '/api/profile?', voter, space, proposal } : null, fetcher)

  // only query api if the parameter hasn't been changed for 1s
  // to prevent sending many requests while user scrolling over
  useEffect(() => {
    setShouldFetch(false)
    const timer = setTimeout(() => {
      setShouldFetch(true)
    }, 180);
    return () => clearTimeout(timer);
  }, [voter, space, proposal])

  if (error) {
    console.debug("❎VoterProfile.api", { voter, space, proposal, error })
    return (
      <div />
    )
  } else if (isLoading) {
    // skeleton loader
    return (
      <div className="absolute z-10 -left-80 bg-white rounded-lg shadow p-5 flex flex-col space-y-5 animate-pulse">
        {/* Avatar */}
        <div className='flex justify-center'>
          <img className="rounded-full bg-slate-200 h-20 w-20 p-3" />
        </div>

        {/* Stats */}
        <div className='flex justify-between space-x-10'>
          <FormattedAddress address={voter} style="text-gray-900" overrideURLPrefix="https://juicetool.xyz/snapshot/profile/" openInNewWindow={true} />
          <div className="rounded-full bg-slate-200 h-2"></div>

          <div className='flex space-x-1'>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div className="rounded-full bg-slate-200 h-2"></div>

            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <div className="rounded-full bg-slate-200 h-2"></div>

            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div className="rounded-full bg-slate-200 h-2"></div>
          </div>
        </div>

        {/* Delegate */}
        <button className="h-2 bg-slate-200 inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 mt-2 text-sm font-medium disabled:text-black text-white shadow-sm w-full">

        </button>
      </div>
    )
  } else if (voter && data) {
    return (
      <div className="absolute z-10 -left-80 bg-white rounded-lg shadow p-5 flex flex-col space-y-5 ease-in duration-100">
        {/* Avatar */}
        <div className='flex justify-center'>
          <img src={`https://cdn.stamp.fyi/avatar/${voter}`} className="rounded-full h-20 w-20 p-3" />

          {data.delegators.slice(0, 2).map(d => <img key={d} src={`https://cdn.stamp.fyi/avatar/${d}`} className="rounded-full h-20 w-20 p-3" />)}
        </div>

        {/* Stats */}
        <div className='flex justify-between space-x-10'>
          <FormattedAddress address={voter} style="text-gray-900" overrideURLPrefix="https://juicetool.xyz/snapshot/profile/" openInNewWindow={true} />

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
              {data.votes ?? 0}
            </span>

            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>
              {data.vp ? formatNumber(data.vp) : '0'}
            </span>
          </div>
        </div>

        {/* Delegate */}
        <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 mt-2 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full">
          Delegate
        </button>
      </div>
    )
  } else {
    return (
      <div />
    )
  }
}
