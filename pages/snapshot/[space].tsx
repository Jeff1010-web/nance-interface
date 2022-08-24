import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import { useProposalsExtendedOf } from "../../hooks/ProposalsExtendedOf";
import { useAccount } from 'wagmi'
import { Web3Provider } from '@ethersproject/providers';
import SiteNav from "../../components/SiteNav";
import SpaceProposalNavigator from '../../components/SpaceProposalNavigator';
import ProposalCards from '../../components/ProposalCards';
import useSpaceInfo from '../../hooks/SpaceInfo';

export const Web3Context = createContext(undefined);

export default function SnapshotSpace() {
    // router
    const router = useRouter();
    const { space } = router.query;
    // handler
    const updateKeywordAndLimit = () => {
        setKeyword((document.getElementById("proposal-keyword") as HTMLInputElement).value);
        setLimit(parseInt((document.getElementById("proposal-limit") as HTMLInputElement).value));
    }
    // external hook
    const { address, isConnected } = useAccount();
    const { data: spaceInfo } = useSpaceInfo(space as string);
    // state
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
            <SiteNav pageTitle={`${spaceInfo?.name || space} Proposals`} currentIndex={5} description="Snapshot voting with filter, search bar and quick overview on single page." image="/images/unsplash_voting.jpeg" />
            <SpaceProposalNavigator spaceId={space as string} spaceInfo={spaceInfo} address={address} options={filterOptions} />
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
                            <ProposalCards address={address} spaceId={space as string} proposals={filteredProposals} votedData={votedData} />
                        )}
                    </Web3Context.Provider>
                </div>
            </div>
        </>
    )
}