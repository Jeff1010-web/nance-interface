import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router'
import { useProposalsExtendedOf } from "../../hooks/ProposalsExtendedOf";
import { useAccount } from 'wagmi'
import ReactMarkdown from 'react-markdown'
import { fromUnixTime, formatDistanceToNow, isPast } from 'date-fns'
import { ResponsiveContainer, PieChart, Pie, Tooltip as TooltipInChart, Cell, Legend } from 'recharts';
import useFollowedSpaces from "../../hooks/FollowedSpaces";
import snapshot from '@snapshot-labs/snapshot.js';
import { Web3Provider } from '@ethersproject/providers';
import { Button, Modal, Tooltip } from 'flowbite-react';
import useVotingPower from "../../hooks/VotingPower";
import SiteNav from "../../components/SiteNav";

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact" , compactDisplay: "short" });
const formatNumber = (num) => formatter.format(num);

function genOnEnter(elementId: string) {
    return (e: { keyCode: number; }) => {
        if(e.keyCode == 13) {
            document.getElementById(elementId).click();
        }
    }
}

const hub = 'https://hub.snapshot.org'; // or https://testnet.snapshot.org for testnet
const client = new snapshot.Client712(hub);
const Web3Context = createContext(undefined);

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
    const [web3, setWeb3] = useState(undefined);
    const connectedAddress = isConnected ? address : "";
    // load data
    const { loading, data, error } = useProposalsExtendedOf(
        space as string, filterByActive, 
        keyword, connectedAddress,
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

    useEffect(() => {
        if (window.ethereum) {
            setWeb3(new Web3Provider(window.ethereum));
        }
    }, []);

    return (
        <>
            <SiteNav pageTitle={`${space} Proposals`} currentIndex={5} />
            <div className="flex my-6 flex-col gap-y-3">
                <div id="space-navigate" className="flex justify-center gap-x-2">
                    <p>Navigate to: </p>
                    <FollowedSpaces address={connectedAddress} />
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
                    {!loading && filteredProposals?.length && <div className="text-center">Loaded {filteredProposals.length} proposals.</div>}
                    {error && <div className="text-center">Something wrong.</div>}
                </div>
                <div className="flex flex-row flex-wrap mx-4 px-20 justify-center">
                    <Web3Context.Provider value={web3}>
                        {loading && <div className="text-center">Loading proposals...</div>}
                        {!loading && !error && (
                            filteredProposals.map(proposal => <ProposalCard key={proposal.id} spaceId={space} proposal={proposal} voted={votedData[proposal.id]} address={connectedAddress} />)
                        )}
                    </Web3Context.Provider>
                </div>
            </div>
        </>
    )
}

function ProposalCard({spaceId, proposal, voted, address}) {
    return (
        <div className="border-2 rounded-xl m-3 p-3 hover:border-slate-800 transition-colors max-w-3xl">
            <h3 className="text-xl font-semibold">{proposal.title}</h3>
            <br/>
            <div id={`proposal-analytic-${proposal.id}`} className="flex gap-x-2 h-48">
                <div className="w-1/3 flex flex-col grow gap-y-2">
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
                    <div className="flex flex-row gap-x-2">
                        <VotingModal address={address} spaceId={spaceId} proposalId={proposal.id} proposalTitle={proposal.title} choices={proposal.choices} expired={isPast(fromUnixTime(proposal.end))} />
                        <a className="px-4 py-2 font-semibold text-center text-sm bg-amber-200 hover:bg-amber-300 rounded-xl shadow-sm" href={`https://snapshot.org/#/${spaceId}/proposal/${proposal.id}`} target="_blank" rel="noreferrer">Snapshot</a>
                    </div>
                </div>

                <div className="w-2/3 truncate">
                    <VotesPieChart data={proposal.voteByChoice} />
                </div>
            </div>
            <div id={`proposal-${proposal.id}-content`} className="h-40 overflow-hidden hover:overflow-scroll border-t-2 mt-2">
                <br />
                <ReactMarkdown>{proposal.body}</ReactMarkdown>
            </div>
        </div>
    )
}

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
}
const renderLegend = (props) => {
    const { payload } = props;
  
    return (
      <ul>
        {
          payload.map((entry, index) => (
            <li key={`item-${index}`} className="px-2 truncate">
                <Tooltip
                    content={entry.value}
                    trigger="hover"
                >
                    <svg width="14" height="14" viewBox="0 0 32 32" version="1.1" className="inline-block mr-1">
                        <path stroke="none" fill={COLORS[index % COLORS.length]} d="M0,4h32v24h-32z" className="recharts-legend-icon"></path>
                    </svg>
                    <span style={{color: COLORS[index % COLORS.length]}}>{entry.value}</span>
                </Tooltip>
            </li>
          ))
        }
      </ul>
    );
}

function VotesPieChart({data}: {[choice: string]: number}) {
    const entries = Object.entries(data);
    return (
        <ResponsiveContainer>
            <PieChart>
                <Pie data={entries.map(entry => { return { "name": entry[0], "value": entry[1] }; })} dataKey="value" cx="30%" cy={80} outerRadius={80} nameKey="name" fill="#8884d8" label={renderCustomizedLabel} labelLine={false}>
                    {entries.map(entry => { return { "name": entry[0], "value": entry[1] }; }).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <TooltipInChart formatter={(value, name, props) => formatNumber(value)} />
                <Legend width={150} wrapperStyle={{ top: 10, right: 10, backgroundColor: '#f5f5f5', border: '1px solid #d5d5d5', borderRadius: 3, lineHeight: '40px' }} content={renderLegend} />
            </PieChart>
        </ResponsiveContainer>
    );
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
        <select id="followed-spaces" className="rounded-xl p-2" onChange={handleChanges}>
            <option key="none" value="none">- Followed Space -</option>
            {data && Object.entries(data).map(entry => (
                <option key={entry[0]} value={entry[0]}>
                    {entry[0]}{entry[1] > 0 && ` (${entry[1]})`}
                </option>
            ))}
        </select>
    )
}

interface VotingProps {
    expired?: boolean;
    address: string;
    spaceId: string;
    proposalId: string;
    proposalTitle: string;
    choices: string[];
}

function VotingModal({address, spaceId, proposalId, proposalTitle, choices, expired}: VotingProps) {
    const web3 = useContext(Web3Context);
    const [show, setShow] = useState(false);
    const { data: vp, loading } = useVotingPower(address, spaceId, proposalId);

    const vote = async () => {
        const choice = (document.getElementById("choice-selector") as HTMLInputElement).value;
        try {
            const receipt = await client.vote(web3, address, {
                space: spaceId,
                proposal: proposalId,
                type: 'single-choice',
                choice: parseInt(choice),
                app: 'juicetool'
            });
            console.info("📗 VotingModal ->", {spaceId, proposalId, choice, proposalTitle}, receipt);
            setShow(false);
        } catch (e) {
            console.error("🔴 VotingModal ->", e);
        }
    }

    const renderDisabledButton = (reason) => {
        return (
            <Tooltip
                content={reason}
                trigger="hover"
            >
                <button id="load-btn" disabled className="px-4 py-2 font-semibold text-sm bg-gray-200 rounded-xl shadow-sm">Vote</button>
            </Tooltip>
        )
    }

    if (loading) {
        return renderDisabledButton("Loading...");
    }
    
    if (expired) {
        return renderDisabledButton("Proposal has expired");
    }

    if (!web3) {
        return renderDisabledButton("MetaMask not found");
    }

    if (address === '') {
        return renderDisabledButton("Wallet not connected");
    }

    return (
        <>
            <button id="load-btn" onClick={() => setShow(true)} className="px-4 py-2 font-semibold text-sm bg-amber-200 hover:bg-amber-300 rounded-xl shadow-sm">Vote</button>
            <Modal
                show={show}
                onClose={() => setShow(false)}
            >
                <Modal.Header>
                    Voting | {proposalTitle}
                </Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p>Your voting power: {formatNumber(vp)}</p>
                        Choice:&nbsp;
                        <select id="choice-selector" className="rounded-xl">
                            {choices.map((choice, index) => (
                                <option key={index+1} value={index+1}>{choice}</option>
                            ))}
                        </select>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={vote}>
                        Vote
                    </Button>
                    <Button
                        color="gray"
                        onClick={() => setShow(false)}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}