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
  const { commonProps } = useContext(ProposalContext);
  const proposalId = commonProps.proposalId;
  const sourceSnapshot = commonProps.uuid === "snapshot"; // hack
  const proposalIdSpacer = proposalId ? ": " : "";
  console.log(commonProps);
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
          {proposalId}{proposalIdSpacer}{commonProps.title}
        </h1>

        <p className="mt-2 flex text-sm text-gray-500">
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
        </p>
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

        <p className="text-sm text-gray-500">
          on&nbsp;
          {format(toDate(commonProps.created * 1000), "LLL dd, u KK:mm a")}
        </p>

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
