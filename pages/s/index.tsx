import Footer from "../../components/Footer"
import ResolvedProject from "../../components/ResolvedProject"
import SiteNav from "../../components/SiteNav"
import { useAllSpaceInfo } from "../../hooks/NanceHooks"

export default function NanceAllSpacePage() {
  return (
    <>
        <SiteNav
            pageTitle="All Spaces"
            description="All spaces created and hosted on Nance platform."
            image={`https://cdn.stamp.fyi/space/jbdao.eth?w=1200&h=630`}
            withWallet />
        <AllSpace />
        <Footer />
    </>
  )
}

function AllSpace() {
    const { data, error } = useAllSpaceInfo()

    return (
        <div className="m-4 lg:m-6 flex justify-center lg:px-20">
            <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
                {data?.data?.map((spaceInfo) => (
                    <li key={spaceInfo.name} className="overflow-hidden rounded-xl border border-gray-200">
                        <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                            <a href={`/s/${spaceInfo.name}`}>
                                <img
                                    src={`https://cdn.stamp.fyi/space/${spaceInfo.snapshotSpace}?s=160`}
                                    alt={`${spaceInfo.name} Logo`}
                                    className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
                                    />
                            </a>
                            <a href={`/s/${spaceInfo.name}`} className="text-sm font-medium leading-6 text-gray-900">{spaceInfo.name}</a>
                        </div>
                        <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
                            <div className="flex justify-between gap-x-4 py-3">
                            <dt className="text-gray-500">Current cycle</dt>
                            <dd className="text-gray-700">
                                {`${spaceInfo.currentEvent?.title ? `${spaceInfo.currentEvent?.title} of ` : ''}GC${spaceInfo.currentCycle}`}
                            </dd>
                            </div>
                            <div className="flex justify-between gap-x-4 py-3">
                            <dt className="text-gray-500">Treasury</dt>
                            <dd className="flex items-start gap-x-2">
                                <ResolvedProject version={3} projectId={parseInt(spaceInfo.juiceboxProjectId)} />
                            </dd>
                            </div>
                        </dl>
                    </li>
                ))}
            </ul>
        </div>
    )
}
