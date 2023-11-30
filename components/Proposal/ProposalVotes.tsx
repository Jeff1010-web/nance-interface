import {
  useQueryParams,
  withDefault,
  NumberParam,
  createEnumParam,
} from "next-query-params";
import { useContext, useState } from "react";
import {
  useProposalVotes,
  VOTES_PER_PAGE,
} from "@/utils/hooks/snapshot/Proposals";
import { formatNumber } from "@/utils/functions/NumberFormatter";
import { processChoices } from "@/utils/functions/snapshotUtil";
import { classNames } from "@/utils/functions/tailwind";
import ColorBar from "@/components/common/ColorBar";
import NewVoteButton from "@/components/Vote/NewVoteButton";
import VoterProfile from "@/components/Vote/VoterProfile";
import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import { ProposalContext } from "./context/ProposalContext";

const getColorOfChoice = (choice: string) => {
  if (choice == "For") {
    return "text-green-500";
  } else if (choice == "Against") {
    return "text-red-500";
  } else if (choice == "Abstain") {
    return "text-gray-500";
  } else {
    return "";
  }
};

export default function ProposalVotes({
  snapshotSpace,
}: {
  snapshotSpace: string;
}) {
  const { proposalInfo } = useContext(ProposalContext);
  const [selectedVoter, setSelectedVoter] = useState<string>("");
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 1),
    sortBy: withDefault(createEnumParam(["time", "vp"]), "time"),
    withField: withDefault(createEnumParam(["reason", "app"]), ""),
    filterBy: withDefault(createEnumParam(["for", "against"]), ""),
  });

  const { loading, data, error, refetch } = useProposalVotes(
    proposalInfo,
    Math.max((query.page - 1) * VOTES_PER_PAGE, 0),
    query.sortBy as "created" | "vp",
    query.withField as "reason" | "app" | "",
  );

  const proposalType = proposalInfo?.type ?? "";
  const isSimpleVoting = ![
    "approval",
    "ranked-choice",
    "quadratic",
    "weighted",
  ].includes(proposalType);

  let votes = data?.votesData;
  if (query.filterBy === "for") {
    votes = votes.filter((v) => v.choice === "For");
  } else if (query.filterBy === "against") {
    votes = votes.filter((v) => v.choice === "Against");
  }

  return (
    <div
      className="flex flex-col"
      style={{
        maxHeight: "calc(100vh - 12rem)",
      }}
    >
      <div className="overflow-y-scroll pt-5">
        <div className="">
          {isSimpleVoting && (
            <>
              <div className="flex justify-between">
                <p
                  className={classNames(
                    "cursor-pointer text-sm text-green-500",
                    query.filterBy === "for" ? "underline" : "",
                  )}
                  onClick={() => {
                    if (query.filterBy === "for") setQuery({ filterBy: "" });
                    else setQuery({ filterBy: "for" });
                  }}
                >
                  FOR {formatNumber(proposalInfo?.scores[0] || 0)}
                </p>

                <p
                  className={classNames(
                    "cursor-pointer text-sm text-red-500",
                    query.filterBy === "against" ? "underline" : "",
                  )}
                  onClick={() => {
                    if (query.filterBy === "against")
                      setQuery({ filterBy: "" });
                    else setQuery({ filterBy: "against" });
                  }}
                >
                  AGAINST {formatNumber(proposalInfo?.scores[1] || 0)}
                </p>
              </div>

              <div className="p-3 text-sm text-gray-500">
                <ColorBar
                  greenScore={proposalInfo?.scores[0] || 0}
                  redScore={proposalInfo?.scores[1] || 0}
                  noTooltip
                />
              </div>
            </>
          )}

          {!isSimpleVoting && (
            <>
              <div className="flex justify-between">
                <p className="text-sm text-green-500">
                  VOTES {formatNumber(proposalInfo?.scores_total || 0)}
                </p>
              </div>

              <div className="p-3 text-sm text-gray-500">
                <ColorBar
                  greenScore={proposalInfo?.scores_total || 0}
                  redScore={0}
                  noTooltip
                />
              </div>
            </>
          )}

          <div className="flex justify-between">
            <p className="text-sm">
              QUORUM {formatNumber(proposalInfo?.quorum || 0)}
            </p>
            <p className="text-sm">
              VOTER {formatNumber(proposalInfo?.votes || 0)}
            </p>
          </div>
        </div>

        <ul role="list" className="space-y-2 pt-2">
          {loading && "loading..."}
          {votes?.map((vote) => (
            <li key={vote.id}>
              <div
                className={classNames(
                  "flex flex-col",
                  vote.voter === selectedVoter ? "shadow" : "",
                )}
              >
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    vote.voter === selectedVoter
                      ? setSelectedVoter("")
                      : setSelectedVoter(vote.voter)
                  }
                >
                  {isSimpleVoting && (
                    <div className="flex justify-between text-sm">
                      <div className="flex">
                        <div className="inline">
                          <FormattedAddress
                            address={vote.voter}
                            style="text-gray-900"
                            minified
                          />
                        </div>
                        &nbsp;
                        <span
                          className={classNames(
                            getColorOfChoice(
                              processChoices(
                                proposalInfo?.type,
                                vote.choice,
                              ) as string,
                            ),
                            "",
                          )}
                        >
                          voted{" "}
                          {
                            processChoices(
                              proposalInfo?.type,
                              vote.choice,
                            ) as string
                          }
                        </span>
                      </div>

                      <div>
                        {`${formatNumber(vote.vp)} (${(
                          (vote.vp * 100) /
                          (proposalInfo?.scores_total ?? 1)
                        ).toFixed()}%)`}
                      </div>
                    </div>
                  )}

                  {!isSimpleVoting && (
                    <div className="flex flex-col text-sm">
                      <div>
                        <FormattedAddress
                          address={vote.voter}
                          style="text-gray-900"
                          minified
                        />
                      </div>

                      <div className="text-xs font-semibold text-slate-700">
                        {`${formatNumber(vote.vp)} (${(
                          (vote.vp * 100) /
                          (proposalInfo?.scores_total ?? 1)
                        ).toFixed()}%)`}{" "}
                        total
                      </div>

                      <div className="py-2 text-sm text-gray-600">
                        {(
                          processChoices(
                            proposalInfo?.type,
                            vote.choice,
                          ) as string[]
                        ).map((choice, idx) => (
                          <p key={`${vote.id} - ${idx}`}>{choice}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {vote.reason && (
                    <div className="text-sm text-gray-600">{vote.reason}</div>
                  )}
                </div>

                <VoterProfile
                  space="jbdao.eth"
                  proposal={proposalInfo?.id || ""}
                  voter={vote.voter}
                  isOpen={vote.voter === selectedVoter}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <NewVoteButton
        snapshotSpace={snapshotSpace}
        snapshotProposal={proposalInfo}
        refetch={refetch}
      />
    </div>
  );
}
