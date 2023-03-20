import { Popover } from '@headlessui/react'
import useSWR, { Fetcher } from 'swr'
import { ProfileResponse } from '../pages/api/profile';

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact", compactDisplay: "short" });
const formatNumber = (num) => formatter.format(num);

interface VoterProfileProps {
  voter: string
  space: string
  proposal: string
}

const fetcher: Fetcher<ProfileResponse, VoterProfileProps & { url: string }> = ({ url, voter, space, proposal }) =>
  fetch(url + new URLSearchParams({ voter, space, proposal }))
    .then(res => res.json())

// avatar, voting power, votes cast, delegate function
export default function VoterProfile({ voter, space, proposal }: VoterProfileProps) {
  const { data, error, isLoading } = useSWR({ url: '/api/profile?', voter, space, proposal }, fetcher)

  if (voter && data) {
    return (
      <div className="absolute z-10 -left-60 bg-white rounded-lg shadow p-5">
        <Popover>
          <div>
            <Popover.Panel static>
              <img src={`https://cdn.stamp.fyi/avatar/${voter}`} className="rounded-full center p-3" />
              <p>Represented: {1 + data.delegators.length}</p>
              <p>Voing Power: {formatNumber(data.vp)}</p>
              <p>Votes Cast: {data.votes}</p>

              <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 mt-2 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full">
                Delegate
              </button>
            </Popover.Panel>
          </div>
        </Popover>
      </div>
    )
  } else {
    return (
      <div />
    )
  }
}
