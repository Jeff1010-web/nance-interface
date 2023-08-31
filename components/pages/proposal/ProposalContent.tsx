import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useContext, Fragment } from "react";
import { canEditProposal } from "../../../libs/nance";
import { ProposalContext } from "../../../pages/s/[space]/[proposal]";
import FormattedAddress from "../../ethereum/FormattedAddress";
import MarkdownWithTOC from "../../MarkdownWithTOC";
import ProposalNavigator from "./ProposalNavigator";
import ProposalMetadata from "./ProposalMetadata";

export default function ProposalContent({ body }: { body: string }) {
  const { commonProps } = useContext(ProposalContext);

  return (
    <div className="">
      <div className="px-4 py-5 sm:px-6 flex flex-col">
        <Link href={`/s/${commonProps.space}`} className="flex mb-4 rounded-md border-1 shadow-sm w-fit p-2">
          <ArrowUturnLeftIcon className="h-5 w-5 mr-1" />
          Back
        </Link>

        <h1 id="applicant-information-title" className="text-3xl font-medium">
          {canEditProposal(commonProps.status) ? `[${commonProps.status}] ` : ""}{commonProps.title}
        </h1>

        <p className="text-sm text-gray-500 text-right">
          by&nbsp;
          <FormattedAddress address={commonProps.author} style="text-gray-500" overrideURLPrefix="/u/" openInNewWindow={false} />
        </p>
        { commonProps.coauthors.length > 0 && (
          <p className="text-sm text-gray-500 text-right">
            co-authored by&nbsp;
            {commonProps.coauthors.map((coauthor, i) => (
              <Fragment key={i}>
                <FormattedAddress address={coauthor} style="text-gray-500" overrideURLPrefix="/u/" openInNewWindow={false} />
                {i < commonProps!.coauthors.length - 1 && ', '}
              </Fragment>
            ))}
          </p>
        )}

        <ProposalMetadata />
      </div>

      <div className="px-4 sm:px-6">
        <MarkdownWithTOC body={body} />
      </div>

      <div className="px-4 py-5 sm:px-6 mt-4">
        <ProposalNavigator />
      </div>
    </div>
  );
}