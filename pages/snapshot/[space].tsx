import { createContext } from 'react';
import { useRouter } from 'next/router'
import { useProposalsExtendedOf } from "../../hooks/ProposalsExtendedOf";
import { useAccount } from 'wagmi'
import SiteNav from "../../components/SiteNav";
import SpaceProposalNavigator from '../../components/SpaceProposalNavigator';
import ProposalCards from '../../components/ProposalCards';
import useSpaceInfo from '../../hooks/SpaceInfo';
import {useQueryParam, BooleanParam, StringParam, NumberParam, withDefault} from 'next-query-params';

export const Web3Context = createContext(undefined);

export default function SnapshotSpace() {
    // router
    const router = useRouter();
    const { space } = router.query;
    // external hook
    const { address, isConnected } = useAccount();
    const { data: spaceInfo } = useSpaceInfo(space as string);
    // state
    const [filterByActive, setFilterByActive] = useQueryParam('active', withDefault(BooleanParam, false));
    const [filterByNotVoted, setFilterByNotVoted] = useQueryParam('notVoted', withDefault(BooleanParam, false));
    const [filterByUnderQuorum, setFilterByUnderQuorum] = useQueryParam('underQuorum', withDefault(BooleanParam, false));
    const [keyword, setKeyword] = useQueryParam('keyword', withDefault(StringParam, ''));
    const [limit, setLimit] = useQueryParam('limit', withDefault(NumberParam, 10));
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

    const filterOptions = [
        {id: "active", name: "Active", value: filterByActive, setter: setFilterByActive},
        {id: "not-voted", name: "Haven't voted", value: filterByNotVoted, setter: setFilterByNotVoted},
        {id: "under-quorum", name: "Under quorum", value: filterByUnderQuorum, setter: setFilterByUnderQuorum}
    ]

    return (
        <>
            <SiteNav pageTitle={`${spaceInfo?.name || (space as string) || ''} Proposals`} description="Snapshot voting with filter, search bar and quick overview on single page." image="/images/unsplash_voting.jpeg" />
            <SpaceProposalNavigator spaceId={space as string} spaceInfo={spaceInfo} address={address} options={filterOptions} keyword={keyword} setKeyword={setKeyword} limit={limit} setLimit={setLimit} />
            <div className="flex my-6 flex-col gap-y-3">
                <div className="underline">
                    {/* {!loading && filteredProposals && <div className="text-center">Loaded {filteredProposals.length} proposals.</div>} */}
                    {error && <div className="text-center">Something wrong.</div>}
                </div>
                <div className="flex flex-row flex-wrap mx-4 px-4 lg:px-20 justify-center">
                    {loading && <div className="text-center">Loading proposals...</div>}
                    {!loading && !error && (
                        <ProposalCards address={address} spaceId={space as string} proposals={filteredProposals} votedData={votedData} />
                    )}
                </div>
            </div>
        </>
    )
}