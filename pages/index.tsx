import SiteNav from "../components/SiteNav"
import { useTotalSupplyOfProject } from "../hooks/juicebox/TotalSupplyOfProject"
import { formatTokenBalance } from "../libs/NumberFormatter"
import useSnapshotSpaceInfo from "../hooks/snapshot/SpaceInfo"

import { NANCE_DEFAULT_SPACE } from "../constants/Nance"

import Footer from "../components/Footer"
import NanceSpacePage from "../components/nance/Space"

export default function NanceProposals() {
  let space = NANCE_DEFAULT_SPACE;
  const newPageQuery: any = { version: 2, project: 1 };

  return (
    <>
      <SiteNav pageTitle="JuiceboxDAO Governance" description="JuiceboxDAO Governance Platform" image="/images/opengraph/homepage.png" withWallet />
      <NanceSpacePage space={space} />
      <Footer />
    </>
  )
}

function SpaceStats() {
  // JBX total supply across v1, v2 and v3
  const { value: v1Supply } = useTotalSupplyOfProject({ projectId: 1, version: 1 });
  const { value: v2Supply } = useTotalSupplyOfProject({ projectId: 1, version: 2 });
  const { value: v3Supply } = useTotalSupplyOfProject({ projectId: 1, version: 3 });
  // JuiceboxDAO Snapshot followers
  const { data: spaceInfo } = useSnapshotSpaceInfo('jbdao.eth');

  const totalSupply = v1Supply?.add(v2Supply ?? 0)?.add(v3Supply ?? 0);

  return (
    <>
      <div className="">
        <h1 className="text-sm font-semibold text-gray-900">Overview</h1>
        <div className="flex justify-between space-x-5">
          <div>
            <p className="text-xs text-gray-500">Voting Tokens</p>
            <p className="text-xs text-gray-500">Elligible Addresses</p>
            <p className="text-xs text-gray-500">Snapshot Followers</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 text-right">{totalSupply ? formatTokenBalance(totalSupply) : '-'}</p>
            <p className="text-xs text-gray-500 text-right">-</p>
            <p className="text-xs text-gray-500 text-right">{spaceInfo?.followersCount ?? '-'}</p>
          </div>
        </div>
      </div>
      <div className="">
        <h1 className="text-sm font-semibold text-gray-900">Participation</h1>
        <div className="flex justify-between space-x-5">
          <div>
            <p className="text-xs text-gray-500">Proposals/Cycle</p>
            <p className="text-xs text-gray-500">Voting Addresses</p>
            <p className="text-xs text-gray-500">Voting/Total Supply</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 text-right">-</p>
            <p className="text-xs text-gray-500 text-right">-</p>
            <p className="text-xs text-gray-500 text-right">-</p>
          </div>
        </div>
      </div>
    </>
  )
}