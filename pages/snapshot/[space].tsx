import Layout from "../../components/Layout";
import { useState } from 'react';
import { useRouter } from 'next/router'
import { useProposalsExtendedOf } from "../../hooks/ProposalsExtendedOf";
import { useAccount } from 'wagmi'
import ReactMarkdown from 'react-markdown'
import { fromUnixTime, formatDistanceToNow } from 'date-fns'
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';
import useFollowedSpaces from "../../hooks/FollowedSpaces";

const COLORS = ['#ABC9FF', '#FF8B8B', '#FFDEDE', '#FFBB28', '#FF8042'];

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

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact" , compactDisplay: "short" });
const formatNumber = (num) => formatter.format(num);

function genOnEnter(elementId: string) {
    return (e: { keyCode: number; }) => {
        if(e.keyCode == 13) {
            document.getElementById(elementId).click();
        }
    }
}

export default function SnapshotSpace() {
    // router
    const router = useRouter();
    const { space } = router.query;    
    // handler
    const filterHandlerWith = (setFunc) => {
        return (e) => {
            const newStatus = (document.getElementById(e.target.id) as HTMLInputElement).checked;
            setFunc(newStatus);
        }
    }
    const updateKeywordAndLimit = () => {
        setKeyword((document.getElementById("proposal-keyword") as HTMLInputElement).value);
        setLimit(parseInt((document.getElementById("proposal-limit") as HTMLInputElement).value));
    }
    // state
    const { address, isConnected } = useAccount();
    const [filterByActive, setFilterByActive] = useState(false);
    const [filterByNotVoted, setFilterByNotVoted] = useState(false);
    const [filterByUnderQuorum, setFilterByUnderQuorum] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [limit, setLimit] = useState(10);
    // load data
    const { loading, data } = useProposalsExtendedOf(
        space as string, filterByActive, 
        keyword, isConnected ? address : "",
        limit);
    const { proposalsData, votedData } = data;
    console.info("📗 SnapshotSpace.useProposalsExtendedOf.data ->", data);
    // process data
    const votedIds = votedData ? Object.keys(votedData) : [];
    const underQuorumIds = proposalsData ? proposalsData.filter(proposal => proposal.scores_total < proposal.quorum).map(proposal => proposal.id) : [];
    const filteredProposals = proposalsData?.filter(proposal => {
        if (filterByNotVoted && votedIds.includes(proposal.id)) {
            return false;
        }
        if (filterByUnderQuorum && !underQuorumIds.includes(proposal.id)) {
            return false;
        }
        return true;
    });

    const navigateToNewSpace = (e: { keyCode: number; }) => {
        if(e.keyCode == 13) {
            router.push(`/snapshot/${(document.getElementById("space-input") as HTMLInputElement).value}`)
        }
    }
    function genOnEnter(elementId: string) {
        return (e: { keyCode: number; }) => {
            if(e.keyCode == 13) {
                document.getElementById(elementId).click();
            }
        }
    }

    return (
        <Layout
            pageTitle="Snapshot Plus"
            pageDescription="Third-party client with some features. Click proposal and you will go to related page on Snapshot.">
            <div className="flex my-6 flex-col gap-y-3">
                <div id="space-navigate" className="flex justify-center gap-x-2">
                    <p>Navigate to: </p>
                    <FollowedSpaces address={isConnected ? address : ""} />
                    <p>or</p>
                    <input type="text" className="rounded-xl p-2" id="space-input" placeholder="Input space id" onKeyDown={navigateToNewSpace} />
                </div>
                <div id="proposal-filters" className="flex justify-center gap-x-2">
                    <p>Filters: </p>
                    <div className="flex gap-x-1">
                        <input type="checkbox" id="active-checkbox" onClick={filterHandlerWith(setFilterByActive)} />
                        <label htmlFor="active-checkbox">Active</label>
                    </div>
                    <div className="flex gap-x-1">
                        <input type="checkbox" id="voted-checkbox" onClick={filterHandlerWith(setFilterByNotVoted)} />
                        <label htmlFor="voted-checkbox">Not Voted</label>
                    </div>
                    <div className="flex gap-x-1">
                        <input type="checkbox" id="under-quorum-checkbox" onClick={filterHandlerWith(setFilterByUnderQuorum)} />
                        <label htmlFor="under-quorum-checkbox">Under Quorum</label>
                    </div>
                </div>
                <div id="proposal-search" className="flex justify-center gap-x-3">
                    <input type="text" className="rounded-xl p-2" id="proposal-keyword" placeholder="Input keyword in titles" onKeyDown={genOnEnter("load-btn")} />
                    <select id="proposal-limit" className="rounded-xl">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="150">150</option>
                    </select>
                    <button id="load-btn" onClick={updateKeywordAndLimit} className="px-4 py-2 font-semibold text-sm bg-amber-200 hover:bg-amber-300 rounded-xl shadow-sm">Search within {space}</button>
                </div>
                <div className="underline">
                    {!loading && filteredProposals.length != 0 && <div className="text-center">Loaded {filteredProposals.length} proposals.</div>}
                </div>
                <div className="flex flex-row flex-wrap mx-4 px-20 justify-center">
                    {loading && <div className="text-center">Loading proposals...</div>}
                    {!loading && (
                        filteredProposals.map(proposal => <ProposalCard key={proposal.id} space={space} proposal={proposal} voted={votedData[proposal.id]} />)
                    )}
                    {!loading && filteredProposals.length == 0 && <div className="text-center">No proposals found.</div>}
                </div>
            </div>
        </Layout>
    )
}

function ProposalCard({key, space, proposal, voted}) {
    return (
        <div key={key} className="border-2 rounded-xl m-3 p-3 hover:border-slate-800 transition-colors max-w-3xl">
            <h3 className="text-xl font-semibold">{proposal.title}</h3>
            <br/>
            <div id={`proposal-analytic-${proposal.id}`} className="flex">
                <div className="flex flex-col grow">
                    {voted && (
                        <span>Voted: 
                            <span className="text-orange-400">
                                &nbsp;{voted.choice} {formatNumber(voted.score)}
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
                        <span className={(proposal.scores_total<proposal.quorum) ? "text-orange-400" : undefined}> {formatNumber(proposal.scores_total)} </span>
                        / {formatNumber(proposal.quorum)}
                    </span>
                    <a className="rounded-xl border-3 mt-2 p-2 bg-amber-200 border-solid border-slate-200" href={`https://snapshot.org/#/${space}/proposal/${proposal.id}`} target="_blank" rel="noreferrer">Check this on Snapshot</a>
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
        </div>
    )
}

function FollowedSpaces({address}) {
    let { data } = useFollowedSpaces(address);
    if(address === "") {
        data = {};
    }

    const router = useRouter();
    const handleChanges = (e) => {
        const newSpace = e.target.value;
        if (newSpace != "none") {
            router.push(`/snapshot/${e.target.value}`);
        }
    }

    return (
        <select id="followed-spaces" className="rounded-xl p-1" onChange={handleChanges}>
            <option key="none" value="none">-Followed Spaces-</option>
            {data && Object.entries(data).map(entry => (
                <option key={entry[0]} value={entry[0]}>
                    {entry[0]}{entry[1] > 0 && ` (${entry[1]})`}
                </option>
            ))}
        </select>
    )
}