/* This example requires Tailwind CSS v2.0+ */
import { CreditCardIcon, ExternalLinkIcon, ArrowUpIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import SiteNav from '../components/SiteNav'
import { useJBProjects } from 'juice-hooks'
import { useEffect, useState } from 'react'
import fetchMetadata, { consolidateMetadata } from '../libs/projectMetadata'
import FormattedAddress from '../components/FormattedAddress'
import seedrandom from 'seedrandom';
import { BigNumber } from 'ethers'
import { formatDistanceToNow, fromUnixTime } from 'date-fns'
import fetchProjectInfo, { ProjectInfo } from '../hooks/Project'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function formatEtherValue(val: string) {
    // 1e16
    const unit = BigNumber.from("10000000000000000");
    return 'Ξ' + (BigNumber.from(val).div(unit).toNumber()/100).toFixed(2);
}

export default function Lucky() {
    // constant
    const v1ProjectCount = 249 + 394; 
    // state
    const [v2ProjectCount, setV2ProjectCount] = useState(219);
    const [isRandom, setRandom] = useState(false);
    const [projectId, setProjectId] = useState(1);
    const [projectVersion, setProjectVersion] = useState(1);
    const [metadata, setMetadata] = useState(undefined);
    const [projectInfo, setProjectInfo] = useState<ProjectInfo>(undefined);
    const [isLoading, setLoading] = useState<boolean>(false);
    // external call
    const projects = useJBProjects();
    // load total project count
    useEffect(() => {
        projects.count().then(cnt => {
            setV2ProjectCount(cnt.toNumber());
            getNewRandomProject();
        });
    }, [isRandom]);

    const genRandomProject = (randomNumber) => {
        const total = v1ProjectCount + v2ProjectCount;
        const index = Math.floor(randomNumber * total)+1;
        if(index <= v1ProjectCount) {
            return [1, index]
        } else {
            return [2, (index - v1ProjectCount)]
        }
    }

    const getNewRandomProject = () => {
        let randomProjectId: number;
        let randomProjectVersion: number;
        if(isRandom) {
            [randomProjectVersion, randomProjectId] = genRandomProject(Math.random());
        } else {
            const today = new Date();
            today.setHours(0,0,0,0);
            const rng = seedrandom(today.toString());
            [randomProjectVersion, randomProjectId] = genRandomProject(rng());
        }
        console.info('📗 Lucky.random >', {isRandom, v1ProjectCount, v2ProjectCount, randomProjectId, randomProjectVersion});

        setProjectId(randomProjectId);
        setProjectVersion(randomProjectVersion);
        setLoading(true);
        // load infos
        fetchProjectInfo(randomProjectVersion, randomProjectId)
            .then((res) => {
                console.info('📗 Lucky.subgraph >', {res});
                setProjectInfo(res.data.project)
                return fetchMetadata(res.data.project.metadataUri)
                    .then((metadata) => {
                        setMetadata(consolidateMetadata(metadata));
                        setLoading(false);
                    })
            })
            .catch(e => {
                console.error('📗 Lucky.subgraph >', {e});
                setLoading(false);
            })

        // cleanup
        return () => {
            setProjectInfo(undefined);
            setMetadata(undefined);
        }
    }

  return (
    <>
        <SiteNav pageTitle="Feeling lucky" currentIndex={0} description="Feeling lucky, display one juicebox project randomly." image="/images/lucky_demo.png" />
        <div className="flex flex-col flex-wrap mx-4 px-4 lg:px-20 justify-center mt-6">
            <p className="text-center text-lg font-semibold text-gray-600">
                Random Juicebox Project (1 of {v1ProjectCount + v2ProjectCount} projects)
            </p>
            <span className="isolate inline-flex rounded-md flex-row justify-center mt-3">
                <button
                    onClick={() => {
                        setRandom(false);
                    }}
                    disabled={isLoading}
                    type="button"
                    className={classNames(
                        "relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-70 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
                        isRandom ? "bg-white hover:bg-gray-50" : "bg-slate-200"
                    )}
                >
                    Today
                </button>
                <button
                    onClick={() => {
                        if(isRandom) {
                            getNewRandomProject();
                        } else {
                            setRandom(true);
                        }
                    }}
                    disabled={isLoading}
                    type="button"
                    className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white hover:bg-gray-50"
                >
                    {isLoading ? "loading..." : "Roll dice"}
                </button>
                {/* <button
                    type="button"
                    className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white hover:bg-gray-50"
                >
                    Share
                </button> */}
            </span>
            <ul role="list" className="mt-6 grid grid-cols-1 gap-6">
                <li className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow">
                    <div className="flex flex-1 flex-col p-8">
                        <img className="mx-auto h-32 w-32 flex-shrink-0 rounded-full" src={metadata?.logoUri || '/images/juiceboxdao_logo.gif'} alt="project logo" />
                        <h3 className="mt-6 text-lg font-medium text-gray-900">{metadata?.name || `Untitled Project (${projectId})`}</h3>
                        <dl className="mt-1 flex flex-grow flex-col justify-between">
                            <dt className="sr-only">Social links</dt>
                            <dd className="mb-1 space-x-1">
                                {metadata?.twitter &&
                                    <a href={`https://twitter.com/${metadata?.twitter}`} target="_blank" rel="noopener noreferrer">
                                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                            @{metadata?.twitter}
                                        </span>
                                    </a>
                                }
                                {metadata?.discord &&
                                    <a href={metadata?.discord} target="_blank" rel="noopener noreferrer">
                                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                            Discord
                                        </span>
                                    </a>
                                }
                                <a href={projectVersion == 1 ? `https://juicebox.money/p/${projectInfo?.handle || 'juicebox'}` : `https://juicebox.money/v2/p/${projectId}`} target="_blank" rel="noopener noreferrer">
                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                                        {projectVersion == 1 && 'v1: @' + projectInfo?.handle}
                                        {projectVersion == 2 && 'v2: ' + (projectInfo?.handle ? ('@'+projectInfo?.handle) : projectId)}
                                    </span>
                                </a>
                            </dd>
                            <dt className="sr-only">Description</dt>
                            <dd className="text-base text-gray-700 break-words line-clamp-5 lg:line-clamp-3">{metadata?.description || 'Loading metadata...'}</dd>
                            {projectInfo?.createdAt && <dd className="mt-1 text-sm text-gray-500">Created {formatDistanceToNow(fromUnixTime(projectInfo?.createdAt), { addSuffix: true })}</dd>}
                            <dd className="text-sm text-gray-500">Owned by {projectInfo?.owner ? <FormattedAddress address={projectInfo.owner} /> : 'loading...'}</dd>
                            <dt className="sr-only">Stats</dt>
                            <dl className="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow md:grid-cols-3 md:divide-y-0 md:divide-x">
                            <StatCard data={{name: "Volume", stat: formatEtherValue(projectInfo?.totalPaid ?? '0'), change: projectInfo?.totalPaid !== '0' ? (BigNumber.from(projectInfo?.trendingVolume ?? 0).mul(100).div(projectInfo?.totalPaid ?? 1).toNumber()).toFixed(2) + '%' : '0%'}} />
                            <StatCard data={{name: "Recent Payments", stat: ''+(projectInfo?.trendingPaymentsCount??0)}} />
                            <StatCard data={{name: "Balance", stat: formatEtherValue(projectInfo?.currentBalance ?? '0')}} />
                        </dl>
                        </dl>
                    </div>
                    <div>
                        <div className="-mt-px flex divide-x divide-gray-200">
                        <div className="flex w-0 flex-1">
                            <Link href={projectVersion == 1 ? `https://juicebox.money/p/${projectInfo?.handle || 'juicebox'}` : `https://juicebox.money/v2/p/${projectId}`}>
                                <a target="_blank" rel="noopener noreferrer"
                                    className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                                >
                                    <ExternalLinkIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                    <span className="ml-3">Project page</span>
                                </a>
                            </Link>
                        </div>
                        <div className="-ml-px flex w-0 flex-1">
                            <a href={projectVersion == 1 ? `https://juicebox.money/p/${projectInfo?.handle || 'juicebox'}` : `https://juicebox.money/v2/p/${projectId}`} target="_blank" rel="noopener noreferrer"
                                className="relative inline-flex w-0 flex-1 items-center justify-center rounded-br-lg border border-transparent py-4 text-sm font-medium text-gray-700 hover:text-gray-500"
                            >
                                <CreditCardIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                <span className="ml-3">Pay</span>
                            </a>
                        </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </>
  )
}

const stats = [
    { name: 'Total Subscribers', stat: '71,897', previousStat: '70,946', change: '12%', changeType: 'increase' },
    { name: 'Avg. Open Rate', stat: '58.16%', previousStat: '56.14%', change: '2.02%', changeType: 'increase' },
    { name: 'Avg. Click Rate', stat: '24.57%', previousStat: '28.62%', change: '4.05%', changeType: 'decrease' },
  ]

function StatCard({data}: {data: {name: string, stat: string, change?: string}}) {
    return (
        <div className="px-4 py-5 sm:p-6">
            <dt className="text-base text-left font-normal text-gray-900">{data.name}</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                <div className="flex items-baseline text-2xl font-semibold text-indigo-600">
                    {data.stat}
                    {/* <span className="ml-2 text-sm font-medium text-gray-500">from {data.previousStat}</span> */}
                </div>

                {data.change && (
                    <div
                    className='bg-green-100 text-green-800 inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:mt-2 lg:mt-0'
                    >
                        <ArrowUpIcon
                            className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-green-500"
                            aria-hidden="true"
                        />

                        <span className="sr-only"> {'Increased'} by </span>
                        {data.change}
                    </div>
                )}
            </dd>
        </div>
    )
}