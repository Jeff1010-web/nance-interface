import Layout from "../components/Layout";
import { useState } from 'react';
import { useProposalsExtendedOf, useVotedData } from "../hooks/Proposal";
import { useAccount } from 'wagmi'
import ReactMarkdown from 'react-markdown'
import { fromUnixTime, formatDistanceToNow } from 'date-fns'
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#dc2626', '#d97706', '#FFBB28', '#FF8042'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    if (percent < 0.08) {
        return null;
    }

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
    </text>
    );
};

export default function Snapshot() {
    const { address, isConnected } = useAccount();
    const [space, setSpace] = useState('jbdao.eth');
    const [hide, setHide] = useState(false);
    const { loading: proposalsLoading, data: proposalsData } = useProposalsExtendedOf(space);
    const { loading: votedLoading, data: votedData } = useVotedData(space, isConnected ? address : null)
    const loading = proposalsLoading || votedLoading;

    const votedIds = votedData ? Object.keys(votedData) : [];
    const formatter = new Intl.NumberFormat('en-GB', { notation: "compact" , compactDisplay: "short" });
    const formatNumber = (num) => formatter.format(num);

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
                            <a key={proposal.id} href={`https://snapshot.org/#/${space}/proposal/${proposal.id}`} target="_blank" rel="noreferrer" className={`${(votedIds.includes(proposal.id) && hide) ? "hidden" : "block"} border-2 rounded-xl m-3 p-3 hover:border-slate-800 transition-colors max-w-3xl`}>
                                <h3 className="text-xl font-semibold">{proposal.title}</h3>
                                <br/>
                                <div id={`proposal-analytic-${proposal.id}`} className="flex">
                                    <div className="flex flex-col grow">
                                        {votedIds.includes(proposal.id) && (
                                            <span>Voted: 
                                                <span className="text-orange-400">
                                                    &nbsp;{votedData[proposal.id].choice} {formatNumber(votedData[proposal.id].score)}
                                                </span>
                                            </span>
                                        )}
                                        <span>End: 
                                            <span className="text-orange-400">
                                                &nbsp;{formatDistanceToNow(fromUnixTime(proposal.end), { addSuffix: true })}
                                            </span>
                                        </span>
                                        <span>Votes: {proposal.votes}</span>
                                        <span>
                                            Quorum:
                                            <span className={(proposal.scores_total<proposal.quorum) && "text-orange-400"}> {formatNumber(proposal.scores_total)} </span>
                                            / {formatNumber(proposal.quorum)}
                                        </span>
                                    </div>

                                    <div className="grow">
                                        <ResponsiveContainer width="100%" height="100%" minWidth="20rem" minHeight="12rem">
                                            <PieChart>
                                                <Pie data={Object.entries(proposal.voteByChoice).map(entry => { return {"name": entry[0], "value": entry[1]}; })} dataKey="value" cx="50%" cy="130%" outerRadius="80" nameKey="name" fill="#8884d8" label={renderCustomizedLabel} labelLine={false} >
                                                    {Object.entries(proposal.voteByChoice).map(entry => { return {"name": entry[0], "value": entry[1]}; }).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value, name, props) => formatNumber(value)} />
                                                <Legend width={100} wrapperStyle={{ top: 10, right: 0, backgroundColor: '#f5f5f5', border: '1px solid #d5d5d5', borderRadius: 3, lineHeight: '40px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
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