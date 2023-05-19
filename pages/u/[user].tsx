import { useVotesOfAddress } from "../../hooks/snapshot/Proposals";
import SiteNav from "../../components/SiteNav";
import { formatDistanceToNow, fromUnixTime } from "date-fns";
import { withDefault, NumberParam, useQueryParams } from "next-query-params";
import { processChoices } from "../../libs/snapshotUtil";
import ScrollToBottom from "../../components/ScrollToBottom";
import Footer from "../../components/Footer";
import Link from "next/link";
import Pagination from "../../components/Pagination";
import { shortenAddress } from "../../libs/address";
import { classNames } from "../../libs/tailwind";

const getColorOfChoice = (choice: string) => {
  if (choice == 'For') {
    return 'text-green-500';
  } else if (choice == 'Against') {
    return 'text-red-500';
  } else if (choice == 'Abstain') {
    return 'text-gray-500';
  } else {
    return '';
  }
}

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact", compactDisplay: "short" });
const formatNumber = (num) => formatter.format(num);

interface ENSIdeasResponse {
  address: string;
  name: string;
  displayName: string;
  avatar: string;
  error?: string;
}

export async function getServerSideProps(context) {
  const user = context.params.user;

  try {
    const res = await fetch(`https://api.ensideas.com/ens/resolve/${user}`);
    const json: ENSIdeasResponse = await res.json();

    if(!json.error) {
      return {
        props: {
          ensInfo: {
            address: json.address || user,
            name: json.name,
            displayName: json.displayName,
            avatar: json.avatar
          }
        }
      }
    }
  } catch(e) {
    console.warn("❌ user.ENSIdeasAPI.fetch.error", e)
  }

  return {
    props: {
      ensInfo: {
        address: user,
        name: user,
        displayName: shortenAddress(user),
        avatar: ""
      }
    }
  }
}

export default function NanceUserPage({ ensInfo }: { ensInfo: ENSIdeasResponse }) {
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    limit: withDefault(NumberParam, 25)
  });

  const address = ensInfo.address;
  const { data, loading } = useVotesOfAddress(address, (query.page - 1) * query.limit, query.limit);

  return (
    <>
      <SiteNav
        pageTitle={`Profile of ${ensInfo?.displayName || address}`}
        description="Voter profile on Nance."
        image={`https://cdn.stamp.fyi/avatar/${address}`}
        withWallet />

      <div className="min-h-full">
        <main className="py-2">

            <div className="mx-auto mt-4 grid max-w-5xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2 lg:col-start-1">
                {/* Votes */}
                <section aria-labelledby="proposal-title">
                  <div>
                    {data?.votedData?.map((vote) => (
                      <div key={vote.id} className="flex bg-white px-4 py-4 shadow sm:rounded-lg sm:px-6 my-4">
                        <div className={classNames(
                          "flex flex-col space-y-1",
                          vote.reason ? "w-1/2" : ""
                        )}>
                          <Link href={`/p/${vote.proposal.id}`} className="">{vote.proposal.title}</Link>
                          <span className={classNames(
                            getColorOfChoice(processChoices(vote.proposal.type, vote.choice) as string),
                            ''
                          )}>
                            {processChoices(vote.proposal.type, vote.choice) as string} with {formatNumber(vote.vp)}
                          </span>
                          <p className="text-gray-500 text-sm">{formatDistanceToNow(fromUnixTime(vote.created), { addSuffix: true })}</p>
                        </div>

                        {vote.reason && <p className="w-1/2 text-gray-500 border-l-2 pl-4 ml-4">{vote.reason}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section aria-labelledby="stats-title" className="lg:col-span-1 lg:col-start-3">
                <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6 sticky top-6 bottom-6 opacity-100 mt-4" style={{
                  maxHeight: 'calc(100vh - 9rem)'
                }}>

                  <h2 id="applicant-information-title" className="text-3xl font-medium flex">
                    <img src={`https://cdn.stamp.fyi/avatar/${address}`} className="rounded-full h-10 w-10 p-1 mx-2" />
                    {ensInfo?.displayName || address}
                  </h2>
                </div>
              </section>
            </div>

            <ScrollToBottom />
            <div className="flex justify-center">
              <div className="max-w-5xl">
                <Pagination page={query.page} setPage={(p) => setQuery({page: p})} limit={query.limit} total={0} infinite />
              </div>
            </div>
        </main>
      </div>

      <Footer />
    </>
  )
}