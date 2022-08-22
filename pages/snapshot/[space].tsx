import { createContext, useState, useContext, useEffect, MouseEventHandler } from 'react';
import { useRouter } from 'next/router'
import { useProposalsExtendedOf } from "../../hooks/ProposalsExtendedOf";
import { useAccount } from 'wagmi'
import snapshot from '@snapshot-labs/snapshot.js';
import { Web3Provider } from '@ethersproject/providers';
import { Button, Modal, Tooltip } from 'flowbite-react';
import useVotingPower from "../../hooks/VotingPower";
import SiteNav from "../../components/SiteNav";
import SpaceProposalNavigator from '../../components/SpaceProposalNavigator';
import ProposalCards from '../../components/ProposalCards';

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact" , compactDisplay: "short" });
const formatNumber = (num) => formatter.format(num);

const hub = 'https://hub.snapshot.org'; // or https://testnet.snapshot.org for testnet
const client = new snapshot.Client712(hub);
const Web3Context = createContext(undefined);

export default function SnapshotSpace() {
    // router
    const router = useRouter();
    const { space } = router.query;    
    // handler
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

    function genOnEnter(elementId: string) {
        return (e: { keyCode: number; }) => {
            if(e.keyCode == 13) {
                document.getElementById(elementId).click();
            }
        }
    }

    const filterOptions = [
        {id: "active", name: "Active", value: filterByActive, setter: setFilterByActive},
        {id: "not-voted", name: "Haven't voted", value: filterByNotVoted, setter: setFilterByNotVoted},
        {id: "under-quorum", name: "Under quorum", value: filterByUnderQuorum, setter: setFilterByUnderQuorum}
    ]

    useEffect(() => {
        if (window.ethereum) {
            setWeb3(new Web3Provider(window.ethereum));
        }
    }, []);

    return (
        <>
            <SiteNav pageTitle={`${space} Proposals`} currentIndex={5} />
            <SpaceProposalNavigator spaceId={space as string} address={address} options={filterOptions} />
            <div className="flex my-6 flex-col gap-y-3">
                {/* <div id="proposal-search" className="flex justify-center gap-x-3">
                    <input type="text" className="rounded-xl p-2" id="proposal-keyword" placeholder="Input keyword in titles" onKeyDown={genOnEnter("load-btn")} />
                    <select id="proposal-limit" className="rounded-xl">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="150">150</option>
                    </select>
                    <button id="load-btn" onClick={updateKeywordAndLimit} className="px-4 py-2 font-semibold text-sm bg-amber-200 hover:bg-amber-300 rounded-xl shadow-sm">Search within {space}</button>
                </div> */}
                <div className="underline">
                    {/* {!loading && filteredProposals && <div className="text-center">Loaded {filteredProposals.length} proposals.</div>} */}
                    {error && <div className="text-center">Something wrong.</div>}
                </div>
                <div className="flex flex-row flex-wrap mx-4 px-4 lg:px-20 justify-center">
                    <Web3Context.Provider value={web3}>
                        {loading && <div className="text-center">Loading proposals...</div>}
                        {!loading && !error && (
                            <ProposalCards spaceId={space as string} proposals={filteredProposals} />
                        )}
                    </Web3Context.Provider>
                </div>
            </div>
        </>
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