import { useRouter } from "next/router";
import { useProposalExtendedOf } from "../../../../hooks/ProposalsExtendedOf";
import { useAccount } from 'wagmi'
import SiteNav from "../../../../components/SiteNav";
import useSpaceInfo from "../../../../hooks/SpaceInfo";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export default function SnapshotProposal() {
    // router
    const router = useRouter();
    const { space, proposal } = router.query;
    // external hook
    const { address, isConnected } = useAccount();
    const { data: spaceInfo } = useSpaceInfo(space as string);
    // load data
    const { loading, data, error } = useProposalExtendedOf(proposal as string, address);
    console.log('here here', { data, error, loading })

    return (
        <>
            <SiteNav pageTitle={`${spaceInfo?.name || (space as string) || ''} proposal: ${data?.proposalData.title}`} currentIndex={5} description="Snapshot voting with filter, search bar and quick overview on single page." image="/images/unsplash_voting.jpeg" />

            <div className="relative overflow-hidden bg-white py-16">
                <div className="hidden lg:absolute lg:inset-y-0 lg:block lg:h-full lg:w-full">
                    <div className="relative mx-auto h-full max-w-prose text-lg" aria-hidden="true">
                        <svg
                            className="absolute top-12 left-full translate-x-32 transform"
                            width={404}
                            height={384}
                            fill="none"
                            viewBox="0 0 404 384"
                        >
                            <defs>
                                <pattern
                                    id="74b3fd99-0a6f-4271-bef2-e80eeafdf357"
                                    x={0}
                                    y={0}
                                    width={20}
                                    height={20}
                                    patternUnits="userSpaceOnUse"
                                >
                                    <rect x={0} y={0} width={4} height={4} className="text-gray-200" fill="currentColor" />
                                </pattern>
                            </defs>
                            <rect width={404} height={384} fill="url(#74b3fd99-0a6f-4271-bef2-e80eeafdf357)" />
                        </svg>
                        <svg
                            className="absolute top-1/2 right-full -translate-y-1/2 -translate-x-32 transform"
                            width={404}
                            height={384}
                            fill="none"
                            viewBox="0 0 404 384"
                        >
                            <defs>
                                <pattern
                                    id="f210dbf6-a58d-4871-961e-36d5016a0f49"
                                    x={0}
                                    y={0}
                                    width={20}
                                    height={20}
                                    patternUnits="userSpaceOnUse"
                                >
                                    <rect x={0} y={0} width={4} height={4} className="text-gray-200" fill="currentColor" />
                                </pattern>
                            </defs>
                            <rect width={404} height={384} fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
                        </svg>
                        <svg
                            className="absolute bottom-12 left-full translate-x-32 transform"
                            width={404}
                            height={384}
                            fill="none"
                            viewBox="0 0 404 384"
                        >
                            <defs>
                                <pattern
                                    id="d3eb07ae-5182-43e6-857d-35c643af9034"
                                    x={0}
                                    y={0}
                                    width={20}
                                    height={20}
                                    patternUnits="userSpaceOnUse"
                                >
                                    <rect x={0} y={0} width={4} height={4} className="text-gray-200" fill="currentColor" />
                                </pattern>
                            </defs>
                            <rect width={404} height={384} fill="url(#d3eb07ae-5182-43e6-857d-35c643af9034)" />
                        </svg>
                    </div>
                </div>
                <div className="relative px-4 sm:px-6 lg:px-8">
                    <div className="mb-3 px-3 md:px-0">
                        <Link href={`/snapshot/${space}`}>
                            <a>
                                <div className="inline-flex items-center gap-1 text-skin-text hover:text-skin-link">
                                    <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" width="1.2em" height="1.2em">
                                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m11 17l-5-5m0 0l5-5m-5 5h12"></path>
                                    </svg>
                                    Back
                                </div>
                            </a>
                        </Link>
                    </div>
                    <div className="mx-auto max-w-prose text-lg">
                        <h1>
                            {/* <span className="block text-center text-lg font-semibold text-indigo-600">Introducing</span> */}
                            <span className="mt-2 block text-center text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                                {data?.proposalData.title}
                            </span>
                        </h1>
                    </div>
                    <article className="prose prose-lg prose-indigo mx-auto mt-6 text-gray-500">
                        <ReactMarkdown>{data?.proposalData.body}</ReactMarkdown>
                    </article>
                </div>
            </div>
        </>
    )
}
