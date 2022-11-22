import { DocumentSearchIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import Pagination from "../../components/Pagination";
import ScrollTabsWithCount from "../../components/ScrollTabsWithCount";
import SiteNav from "../../components/SiteNav"
import { AllSpacesResponse, fetchAllSpaces } from "../../hooks/snapshot/AllSpaces"
import useFollowedSpaces from "../../hooks/snapshot/FollowedSpaces";

export async function getServerSideProps(context) {
    // Fetch data from external API
    const allSpaces = await fetchAllSpaces();
  
    // Pass data to the page via props
    return { props: { allSpaces } }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const LIMIT = 12;

export default function SnapshotIndexPage({ allSpaces }: { allSpaces: AllSpacesResponse }) {
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState('All')
    const [page, setPage] = useState(1)

    const { address, isConnected } = useAccount();
    const connectedAddress = isConnected ? address : "";
    const { data: followedSpaces } = useFollowedSpaces(connectedAddress);
    const finalFollowedSpaces = connectedAddress ? followedSpaces : [];

    const filteredOption = Object.entries(allSpaces).filter(([key, value]) => {
        if(category !== 'All' && value.categories && !value.categories.includes(category)) {
            return false;
        }
        if(query !== '' && !value.name.toLowerCase().includes(query.toLowerCase())) {
            return false;
        }
        return true;
    })
    // get all unique categories
    const categoryMap: { [key: string]: number } = filteredOption.reduce((acc, [spaceId, spaceMetric]) => {
        for(const category of spaceMetric?.categories || []) {
            if(!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += 1;
        }
        return acc
    }, {})
    // sort and paginate
    let options = filteredOption.sort(([_, a], [__, b]) => (b.followers ?? 0) - (a.followers ?? 0)).slice(0+LIMIT*(page-1), LIMIT*page);
    console.debug("🔧 SnapshotIndexPage.data", {options, categoryMap})

    // if there is no filters enabled, prepend JuiceboxDAO at the top
    if (category === 'All' && query === '' && page === 1) {
        const optionsTruncated = options.filter(([spaceId, _]) => spaceId !== 'jbdao.eth');
        options = [['jbdao.eth', allSpaces['jbdao.eth']], ...optionsTruncated]
    }
        
    return (
        <>
            <SiteNav pageTitle="Snapshot Plus Explore" withWallet />

            <div className="flex justify-center bg-white mb-6 py-6">
                <div className="max-w-7xl w-full">
                    <ScrollTabsWithCount tabs={finalFollowedSpaces.map(data => {return {id: data.id, name: data.name, count: data.activeProposals}})} activeTab={""} />

                    <div>
                        <label htmlFor="email" className="mt-5 block text-sm font-medium text-gray-700">
                            Search spaces
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <div className="relative flex flex-grow items-stretch focus-within:z-10">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <DocumentSearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                name="proposal-title"
                                id="proposal-title"
                                className="block w-full rounded-none rounded-l-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            </div>
                            <div>
                                <label htmlFor="category" className="sr-only">
                                    Category
                                </label>
                                <select
                                    id="limit"
                                    name="limit"
                                    className="relative w-full rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-700 hover:bg-gray-100 bg-gray-50"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option key={category} value={category}>
                                        All ({filteredOption.length})
                                    </option>
                                    {Object.entries(categoryMap).map(([category, count]) => (
                                        <option key={category} value={category}>
                                            {capitalizeFirstLetter(category)} ({count})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                
            </div>

            <div className="flex justify-center">
                <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-6 max-w-7xl">
                    {options.map(([spaceId, spaceMetric]) => (
                        <Link href={`/snapshot/${spaceId}`} key={spaceId}>
                            <a>
                                <li
                                    // key={spaceId}
                                    className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow transition-all hover:border-black"
                                >
                                    <div className="flex flex-1 flex-col p-8">
                                        <img className="mx-auto h-32 w-32 flex-shrink-0 rounded-full" src={`https://cdn.stamp.fyi/space/${spaceId}?s=160`} alt="" />
                                        <h3 className="mt-6 text-lg font-medium text-gray-900">{spaceMetric.name}</h3>
                                        <dl className="mt-1 flex flex-grow flex-col justify-between">
                                            <dt className="sr-only">Members</dt>
                                            <dd className="text-sm text-gray-500">{formatNumberInK(spaceMetric.followers)} Members</dd>
                                            <dt className="sr-only">Role</dt>
                                            {/* <dd className="mt-3">
                                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                {person.role}
                                                </span>
                                            </dd> */}
                                        </dl>
                                    </div>
                                    {/* <div>
                                        <div className="-mt-px flex divide-x divide-gray-200">
                                        <div className="flex w-0 flex-1">
                                            <a
                                            href={`mailto:${person.email}`}
                                            className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-gray-700 hover:text-gray-500"
                                            >
                                            <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            <span className="ml-3">Email</span>
                                            </a>
                                        </div>
                                        <div className="-ml-px flex w-0 flex-1">
                                            <a
                                            href={`tel:${person.telephone}`}
                                            className="relative inline-flex w-0 flex-1 items-center justify-center rounded-br-lg border border-transparent py-4 text-sm font-medium text-gray-700 hover:text-gray-500"
                                            >
                                            <PhoneIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            <span className="ml-3">Call</span>
                                            </a>
                                        </div>
                                        </div>
                                    </div> */}
                                </li>
                            </a>
                        </Link>
                    ))}
                </ul>
            </div>

            <div className="flex justify-center">
                <Pagination page={page} setPage={setPage} total={filteredOption.length} limit={LIMIT} />
            </div>
        </>
    )
}

function formatNumberInK(num) {
    if(!num || num == 0) return 'No'
    return num > 999 ? (num/1000).toFixed(1) + 'K' : num
}
