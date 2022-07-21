import Layout from "../../components/Layout";
import { useState } from 'react';
import { useProposalsExtendedOf, useVotedData } from "../../hooks/Proposal";
import { useAccount } from 'wagmi'
import ReactMarkdown from 'react-markdown'
import { fromUnixTime, formatDistanceToNow } from 'date-fns'

export default function Snapshot() {
    const { address, isConnected } = useAccount();
    const [space, setSpace] = useState('jbdao.eth');
    const [hide, setHide] = useState(false);
    const { loading: proposalsLoading, data: proposalsData } = useProposalsExtendedOf(space);
    const { loading: votedLoading, data: votedData } = useVotedData(space, isConnected ? address : null)
    const loading = proposalsLoading || votedLoading;

    const votedIds = votedData ? Object.keys(votedData) : [];

    return (
        <Layout
            pageTitle="Snapshot Voting Helper"
            pageDescription="Third-party client with some features. Click proposal and you will go to related page on Snapshot.">
            <div className="flex my-6 flex-col">
                <div id="space-selector" className="flex justify-center gap-x-3">
                    <input type="text" className="rounded-xl pl-2" id="snapshot-space-input" placeholder="What's your space" />
                    <button id="load-btn" onClick={() => setSpace(document.getElementById("snapshot-space-input").value)} className="px-4 py-2 font-semibold text-sm bg-amber-200 hover:bg-amber-300 rounded-xl shadow-sm">Load Active Proposals</button>
                </div>
                <div id="space-operator" className="flex justify-center gap-x-3 pt-3">
                    <button id="hide-filter-btn" className="px-4 py-2 font-semibold text-sm bg-amber-200 hover:bg-amber-300 rounded-xl shadow-sm" onClick={() => setHide(!hide)}>{hide ? "Show" : "Hide"} Voted Proposals</button>
                    <button id="batch-vote-btn" className="hidden px-4 py-2 font-semibold text-sm bg-amber-200 hover:bg-amber-300 rounded-xl shadow-sm">Batch Vote</button>
                </div>
                <div className="flex flex-row flex-wrap pt-4 mx-4 px-20 justify-center">
                    {loading && <div className="text-center">Loading proposals...</div>}
                    {!loading && (
                        proposalsData.map(proposal => (
                            <a href={`https://snapshot.org/#/${space}/proposal/${proposal.id}`} target="_blank" rel="noreferrer" className={`${(votedIds.includes(proposal.id) && hide) ? "hidden" : "block"} border-2 rounded-xl m-3 p-3 hover:border-slate-800 transition-colors max-w-3xl`}>
                                <h3 className="text-xl font-semibold">{proposal.title}</h3>
                                {votedIds.includes(proposal.id) && (
                                    <div className="flex flex-row space-x-1 text-orange-400">
                                        <span>You voted {votedData[proposal.id].choice} with {(votedData[proposal.id].score).toLocaleString(undefined)}</span>
                                    </div>
                                )}
                                <div className="flex flex-row space-x-1">
                                    <span>Remaining time: {formatDistanceToNow(fromUnixTime(proposal.end), { addSuffix: true })}</span>
                                </div>
                                <div className="flex flex-row space-x-1">
                                    <span>Scores: {(proposal.scores_total).toLocaleString(undefined)}</span>
                                    <span>Votes: {proposal.votes}</span>
                                </div>
                                <div className="flex flex-row space-x-1 pb-2">
                                    {Object.keys(proposal.voteByChoice).map(choice => (
                                        <span>{choice}: {(proposal.voteByChoice[choice]).toLocaleString(undefined)}</span>
                                    ))}
                                </div>
                                <div id={`proposal-${proposal.id}-content`} className="h-40 overflow-hidden hover:overflow-scroll border-t-2">
                                    <br />
                                    <ReactMarkdown>{proposal.body}</ReactMarkdown>
                                </div>
                            </a>
                        ))  
                    )}
                </div>
            </div>
        </Layout>
    )
}