import { useAllSpaceInfo } from '@/utils/hooks/NanceHooks';
import Image from 'next/image';
import Link from 'next/link';

interface SimpleSpaceEntry {
  id: string;
  name: string;
  snapshotSpace: string;
}

const DEFAULT_TOP4SPACES = [
  {
    id: "juicebox",
    name: "juicebox",
    snapshotSpace: "jbdao.eth"
  },
  {
    id: "moondao",
    name: "moondao",
    snapshotSpace: "tomoondao.eth"
  },
  {
    id: "thirstythirsty",
    name: "thirstythirsty",
    snapshotSpace: "gov.thirstythirsty.eth"
  },
  {
    id: "AfricaDeFiAllianceDAO",
    name: "AfricaDeFiAllianceDAO",
    snapshotSpace: "africadefialliancedao.eth"
  },
]

export default function StatsSection() {
  const { data, error, isLoading } = useAllSpaceInfo();

  const totalProposals = data?.data?.map((space) => space.nextProposalId -1).reduce((a, b) => a + b, 0) || 483;
  const totalSpaces = data?.data?.length || 9;
  const top4Spaces: SimpleSpaceEntry[] = data?.data
    // filter test spaces
    ?.filter((s) => !["gnance", "waterbox", "nance"].includes(s.name))
    // sort by proposal count
    .sort((a, b) => b.nextProposalId - a.nextProposalId)
    // top 4
    .slice(0, 4)
    .map((s) => {
      return {
        id: s.name,
        name: s.displayName,
        snapshotSpace: s.snapshotSpace
      }
    }) || DEFAULT_TOP4SPACES;

  const stats = [
    { id: 1, name: 'Total Votes', value: '1,858' },
    { id: 2, name: 'Total Proposals', value: totalProposals },
    { id: 3, name: 'Unique Voters', value: '121' },
    { id: 4, name: 'Spaces', value: totalSpaces },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by DAOs worldwide
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Governing your DAO is simple when you let Nance handle the heavy lifting.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-4">
            {
              top4Spaces.map((space) => (
                <Link key={space.id} href={`/s/${space.id}`}>
                  <Image
                    className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                    src={`https://cdn.stamp.fyi/space/${space.snapshotSpace}`}
                    alt={space.name}
                    width={158}
                    height={48}
                  />
                </Link>
              ))
            }

          </div>

          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="flex flex-col bg-gray-400/5 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
