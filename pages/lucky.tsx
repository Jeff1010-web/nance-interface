/* This example requires Tailwind CSS v2.0+ */
import { CreditCardIcon, ExternalLinkIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import SiteNav from '../components/SiteNav'
import { useJBProjects, useJBETHPaymentTerminal } from 'juice-hooks'
import { useEffect, useState } from 'react'
import { consolidateMetadata } from '../libs/projectMetadata'
import FormattedAddress from '../components/FormattedAddress'

const SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/id/QmRoxhw8zQzsVpVj8Mf4hs5bYwTxTxyvZEpHPLZ6shVsXy";

export default function Lucky() {
    // state
    const [projectId, setProjectId] = useState(1);
    const [owner, setOwner] = useState(undefined);
    const [metadata, setMetadata] = useState(undefined);
    // external call
    const projects = useJBProjects();
    //const ethTerminal = useJBETHPaymentTerminal();
    useEffect(() => {
        projects.count().then(cnt => {
            const random = Math.floor(Math.random() * cnt.toNumber())+1;
            console.info('📗 Lucky.project >', {total: cnt, random});
            setProjectId(random);
            // load owner
            projects.ownerOf(random).then(addr => setOwner(addr));
            // load metadata
            projects.metadataContentOf(random, '0')
                .then(cid => {
                    console.info('📗 Lucky.metadata >', {url: `https://jbx.mypinata.cloud/ipfs/${cid}`});
                    fetch(`https://jbx.mypinata.cloud/ipfs/${cid}`)
                        .then((res) => res.json())
                        .then((metadata) => setMetadata(consolidateMetadata(metadata)))
                });    
        });
    }, []);

  return (
    <>
        <SiteNav pageTitle="Feeling lucky | JuiceTool" currentIndex={0} description="Feeling lucky, display one juicebox project randomly." image="/images/juiceboxdao_logo.gif" />
        <div className="flex flex-col flex-wrap mx-4 px-4 lg:px-20 justify-center mt-6">
            <p className="text-center text-lg font-semibold text-gray-600">
                Random Juicebox Project
            </p>
            <ul role="list" className="mt-6 grid grid-cols-1 gap-6 max-w-7xl">
                <li className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow">
                    <div className="flex flex-1 flex-col p-8">
                        <img className="mx-auto h-32 w-32 flex-shrink-0 rounded-full" src={metadata?.logoUri || '/images/juiceboxdao_logo.gif'} alt="project logo" />
                        <h3 className="mt-6 text-sm font-medium text-gray-900">{metadata?.name || `Untitled Project (${projectId})`}</h3>
                        <dl className="mt-1 flex flex-grow flex-col justify-between">
                        <dt className="sr-only">Description</dt>
                        <dd className="text-sm text-gray-500">{metadata?.description || 'Loading metadata...'}</dd>
                        <dd className="text-sm text-gray-500">Owned by {owner ? <FormattedAddress address={owner} /> : 'Loading owner...'}</dd>
                        {/* <dt className="sr-only">Stats</dt>
                        <dd className="mt-3">
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                Beta
                            </span>
                        </dd> */}
                        </dl>
                    </div>
                    <div>
                        <div className="-mt-px flex divide-x divide-gray-200">
                        <div className="flex w-0 flex-1">
                            <Link href={`https://juicebox.money/v2/p/${projectId}`}>
                                <a target="_blank" rel="noopener noreferrer"
                                    className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                                >
                                    <ExternalLinkIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                    <span className="ml-3">Juicebox</span>
                                </a>
                            </Link>
                        </div>
                        <div className="-ml-px flex w-0 flex-1">
                            <a
                                href="#"
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

