import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useContext, Fragment } from "react";
import ProposalNavigator from "./ProposalNavigator";
import ProposalMetadata from "./ProposalMetadata";
import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import MarkdownWithTOC from "@/components/Markdown/MarkdownWithTOC";
import { ProposalContext } from "./context/ProposalContext";
import ProposalBadgeLabel from "../Space/sub/card/ProposalBadgeLabel";

export default function ProposalContent({ body }: { body: string }) {
  const { commonProps } = useContext(ProposalContext);

  return (
    <div className="">
      <div className="flex flex-col px-4 py-5 sm:px-6">
        <Link
          href={`/s/${commonProps.space}`}
          className="border-1 mb-4 flex w-fit rounded-md p-2 shadow-sm"
        >
          <ArrowUturnLeftIcon className="mr-1 h-5 w-5" />
          Back
        </Link>
        <div className="mb-2 inline-block">
          <ProposalBadgeLabel status={commonProps.status} />
        </div>
        <h1 id="applicant-information-title" className="text-3xl font-medium">
          {commonProps.title}
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
          <p className="text-left text-sm text-gray-500">
            co-authored by&nbsp;
            {commonProps.coauthors.map((coauthor, i) => (
              <Fragment key={i}>
                <FormattedAddress
                  address={coauthor}
                  style="text-gray-500"
                  overrideURLPrefix="/u/"
                  openInNewWindow={false}
                  minified
                />
                {i < commonProps!.coauthors.length - 1 && ", "}
              </Fragment>
            ))}
          </p>
        )}

        <ProposalMetadata />
      </div>

      <div className="px-4 sm:px-6">
        <MarkdownWithTOC body={body} />
      </div>

      <div className="mt-4 px-4 py-5 sm:px-6">
        <ProposalNavigator />
      </div>
    </div>
  );
}
