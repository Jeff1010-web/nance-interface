import Image from 'next/image';

const stats = [
  { id: 1, name: 'Page Views', value: '18,981' },
  { id: 2, name: 'Total Votes', value: '1,858' },
  { id: 3, name: 'Unique Voters', value: '121' },
  { id: 4, name: 'Spaces', value: '9' },
];

export default function StatsSection() {
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
            <Image
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
              src="https://cdn.stamp.fyi/space/jbdao.eth"
              alt="JuiceboxDAO"
              width={158}
              height={48}
            />
            <Image
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
              src="https://cdn.stamp.fyi/space/gov.thirstythirsty.eth"
              alt="ThirstyThirstyDAO"
              width={158}
              height={48}
            />
            <Image
              className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
              src="https://cdn.stamp.fyi/space/0"
              alt="BanapusDAO"
              width={158}
              height={48}
            />
            <Image
              className="col-span-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1"
              src="https://cdn.stamp.fyi/space/itsnotabearmarket.eth.eth"
              alt="AfricaDeFiAllianceDAO"
              width={158}
              height={48}
            />
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
