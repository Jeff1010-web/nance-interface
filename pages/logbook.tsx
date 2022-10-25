import { useEffect, useState } from 'react'
import fetchProjectEvents, { ProjectEvent } from '../hooks/juicebox/ProjectEvents'
import FormattedAddress from '../components/FormattedAddress'
import { formatDistanceToNow, fromUnixTime } from 'date-fns'
import SiteNav from '../components/SiteNav'
import { NumberParam, useQueryParam, withDefault } from 'next-query-params'
import Pagination from '../components/Pagination'
import useProjectMetadata from '../hooks/juicebox/ProjectMetadata'
import ResolvedProjectWithMetadata from '../components/ResolvedProjectWithMetadata'

export default function LogbookPage() {
  const [events, setEvents] = useState<ProjectEvent[]>([])
  const [page, setPage] = useQueryParam('page', withDefault(NumberParam, 1))
  const [limit, setLimit] = useQueryParam('limit', withDefault(NumberParam, 20))

  useEffect(() => {
    fetchProjectEvents(limit, Math.max((page-1)*limit, 0)).then(data => {
      console.debug("Project Events", data)
      setEvents(data)
    })
  }, [page, limit])

  return (
    <div className="bg-white">
      <SiteNav pageTitle='Juicebox Logbook' />
      <div className="flex p-6 justify-center">
        <ul role="list" className="-mb-8">
          {events.map((event, index) => (
            <li key={event.id}>
              <div className="relative pb-8">
                {index !== events.length - 1 ? (
                  <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  <>
                    <div className="relative">
                      <img
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
                        src={`https://cdn.stamp.fyi/avatar/${event.caller || 0}?s=160`}
                        alt=""
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <FormattedAddress address={event.caller} style={"font-bold"} /> · <p className="mt-0.5 text-sm text-gray-500 inline">{formatDistanceToNow(fromUnixTime(event.timestamp), { addSuffix: true })}</p>
                        </div>
                        <p className="mt-0.5 text-sm"><a className="text-blue-700 font-bold" href={`https://etherscan.io/tx/${event.txHash}`}>{event.eventType}</a> on
                          <ResolvedProjectWithMetadata version={parseInt(event.project.cv[0])} projectId={event.project.projectId} handle={event.project.handle} metadataUri={event.project.metadataUri} style={"text-xs text-black font-semibold"} />
                        </p>
                      </div>
                      {event.description && (
                        <div className="mt-2 text-sm text-gray-700 break-words rounded-lg shadow p-2 border-slate-400">
                          <p>{event.description}</p>
                        </div>
                      )}
                      
                    </div>
                  </>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Pagination page={page} setPage={setPage} limit={limit} total={1000} />
    </div>
  )
}