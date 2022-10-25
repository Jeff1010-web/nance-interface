import { createContext } from 'react';
import { useRouter } from 'next/router'
import { SnapshotVotedData, useProposalsWithFilter } from "../../hooks/snapshot/Proposals";
import { useAccount } from 'wagmi'
import SiteNav from "../../components/SiteNav";
import SpaceProposalNavigator from '../../components/SpaceProposalNavigator';
import ProposalCards from '../../components/ProposalCards';
import useSpaceInfo from '../../hooks/snapshot/SpaceInfo';
import {useQueryParam, BooleanParam, StringParam, NumberParam, withDefault} from 'next-query-params';
import Pagination from '../../components/Pagination';
import { useProposalsOverview } from '../../hooks/snapshot/ProposalsOverview';

export interface SpaceContextData {
    address: string;
    space: string;
    votedData: {
        [id: string]: SnapshotVotedData;
    }
}

export const SpaceContext = createContext<SpaceContextData>(undefined);

export default function SnapshotSpace() {
    // router
    const router = useRouter();
    const { space } = router.query;
    // external hook
    const { address, isConnected } = useAccount();
    const { data: spaceInfo } = useSpaceInfo(space as string);
    // state
    const [page, setPage] = useQueryParam('page', withDefault(NumberParam, 1));
    const [filterByActive, setFilterByActive] = useQueryParam('active', withDefault(BooleanParam, false));
    const [filterByNotVoted, setFilterByNotVoted] = useQueryParam('notVoted', withDefault(BooleanParam, false));
    const [filterByUnderQuorum, setFilterByUnderQuorum] = useQueryParam('underQuorum', withDefault(BooleanParam, false));
    const [keyword, setKeyword] = useQueryParam('keyword', withDefault(StringParam, ''));
    const [limit, setLimit] = useQueryParam('limit', withDefault(NumberParam, 10));
    const connectedAddress = isConnected ? address : "";

    // load data
    const { data: proposalOverview } = useProposalsOverview(space as string, spaceInfo?.proposalsCount, connectedAddress);
    // TODO
    // * skip if proposal overview are not ready
    // * replace this call with useProposalByID
    // * get accurate total count for pagination
    // * support more filter (active/pending/closed voted/not voted etc.)
    const { loading, data, error } = useProposalsWithFilter(
        space as string, filterByActive, 
        keyword, connectedAddress,
        limit, Math.max((page-1)*limit, 0));
    const { proposalsData, votedData } = data;

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
    const accurateTotal = Object.values(proposalOverview ?? {}).filter(v => {
        if (filterByActive && v.state != "active") return false;
        if (filterByNotVoted && v.voted) return false;
        if (filterByUnderQuorum && v.scores_total >= v.quorum) return false;
        return true; 
    }).length;
    let total = accurateTotal || spaceInfo?.proposalsCount || 0;
    if(keyword) total = filteredProposals?.length || 0;

    const filterOptions = [
        {id: "active", name: "Active", value: filterByActive, setter: setFilterByActive},
        {id: "not-voted", name: "Haven't voted", value: filterByNotVoted, setter: setFilterByNotVoted},
        {id: "under-quorum", name: "Under quorum", value: filterByUnderQuorum, setter: setFilterByUnderQuorum}
    ]

    return (
        <>
            <SiteNav 
                pageTitle={`${spaceInfo?.name || (space as string) || ''} Proposals`} 
                description="Snapshot voting with filter, search bar and quick overview on single page." 
                image="/images/unsplash_voting.jpeg"
                withWallet />

            <SpaceContext.Provider 
                value={{address: connectedAddress, space: space as string, votedData}}>

                <SpaceProposalNavigator spaceInfo={spaceInfo}  options={filterOptions} keyword={keyword} setKeyword={setKeyword} limit={limit} setLimit={setLimit} />

                <div className="flex my-6 flex-col gap-y-3">
                    <div className="underline">
                        {/* {!loading && filteredProposals && <div className="text-center">Loaded {filteredProposals.length} proposals.</div>} */}
                        {error && <div className="text-center">Something wrong.</div>}
                    </div>
                    <div className="flex flex-row flex-wrap mx-4 px-4 lg:px-20 justify-center">
                        {loading && <div className="text-center">Loading proposals...</div>}
                        {!loading && !error && filteredProposals.length > 0 && (
                            <>
                                <ProposalCards proposals={filteredProposals} />
                                <Pagination {...{page, setPage, limit, total}} />
                            </>
                        )}
                        {!loading && !error && filteredProposals.length == 0 && (
                            <div className="text-center flex flex-col space-y-4">
                                <span>No eligible proposals found.</span>
                                <button type="button" 
                                    className="items-center rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-black shadow-sm"
                                    onClick={() => {
                                        if(page > 1) setPage(page-1)
                                        else router.back()
                                    }}>
                                    Back to previous page {`(Current: ${page})`}
                                </button>
                                <button type="button" 
                                    className="items-center rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-black shadow-sm"
                                    onClick={() => {
                                        setFilterByActive(false, 'push');
                                        setFilterByNotVoted(false, 'push');
                                        setFilterByUnderQuorum(false, 'push');
                                        setKeyword("", 'push');
                                    }}>
                                    Reset all filters
                                </button>
                                <button type="button" 
                                    className="items-center rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-black shadow-sm"
                                    onClick={() => setLimit(limit*2)}>
                                    Double the limit of proposals {`(Current: ${limit})`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </SpaceContext.Provider>
        </>
    )
}