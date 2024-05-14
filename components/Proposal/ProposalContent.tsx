import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useContext } from "react";
import ProposalNavigator from "./ProposalNavigator";
import ProposalMetadata from "./ProposalMetadata";
import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import MarkdownWithTOC from "@/components/Markdown/MarkdownWithTOC";
import { ProposalContext } from "./context/ProposalContext";
import ProposalBadgeLabel from "../Space/sub/card/ProposalBadgeLabel";
import { format, toDate } from "date-fns";
import ProposalSummaries from "./ProposalSummaries";

export default function ProposalContent({ body }: { body: string }) {
  const { commonProps, proposalIdPrefix } = useContext(ProposalContext);
  const proposalId = commonProps.proposalId;
  const sourceSnapshot = commonProps.uuid === "snapshot"; // hack
  const preTitleDisplay = proposalIdPrefix ? `${proposalIdPrefix}${proposalId}: ` : "";
  console.debug(commonProps);

  const createdAt = format(toDate(commonProps.created * 1000), "MM/dd/yy hh:mm a");
  const updatedAt = format(toDate(commonProps.edited * 1000), "MM/dd/yy hh:mm a");

  return (
    <div className="">
      <div className="flex flex-col px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="inline-block">
            <ProposalBadgeLabel status={commonProps.status} />
          </div>
          <Link href={`/s/${commonProps.space}`} className="w-fit">
            <ArrowUturnLeftIcon className="h-5 w-5" />
          </Link>
        </div>
        <h1 id="applicant-information-title" className="text-3xl font-medium">
          {preTitleDisplay}{commonProps.title}
        </h1>

        <div className="mt-2 flex text-sm text-gray-500">
          by&nbsp;
          <span>
            <FormattedAddress
              address={commonProps.author}
              style="text-gray-500"
              overrideURLPrefix="/u/"
              openInNewWindow={false}
              minified
            />
          </span>
        </div>
        {commonProps.coauthors.length > 0 && (
          <p className="text-sm text-gray-500">
            co-authored with&nbsp;
            {commonProps.coauthors.map((coauthor, i) => (
              <span key={coauthor} className="inline-flex">
                <FormattedAddress
                  address={coauthor}
                  style="text-gray-500"
                  openInNewWindow={false}
                  minified
                />
                <span>{i < commonProps!.coauthors.length - 1 && ", "}</span>
              </span>
            ))}
          </p>
        )}
        <div className="font-mono text-xs text-gray-500 mt-1">
          <p>
            created&nbsp;
            {createdAt}
          </p>

          {commonProps.edited !== commonProps.created && (
            <p>
              updated&nbsp;
              {updatedAt}
            </p>
          )}

          {commonProps.voteStart > 0 && (
            <p>
              vote &nbsp; &nbsp;
              {format(toDate(commonProps.voteStart * 1000), "MM/dd/yy hh:mm a")} - {format(toDate(commonProps.voteEnd * 1000), "MM/dd/yy hh:mm a")}
            </p>
          )}
        </div>
        <ProposalMetadata />
        <ProposalSummaries />
      </div>

      <div className="px-4 sm:px-6">
        <MarkdownWithTOC body={body} />
      </div>

      <div className="mt-4 px-4 py-5 sm:px-6">
        { !sourceSnapshot && <ProposalNavigator /> }
      </div>
    </div>
  );
}
