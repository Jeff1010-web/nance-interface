import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { format, toDate } from "date-fns";
import { NANCE_API_URL } from "@/constants/Nance";
import { openInDiscord } from "@/utils/functions/discord";
import { useContext } from "react";
import Link from "next/link";
import ActionLabel from "@/components/ActionLabel/ActionLabel";
import { ProposalContext } from "./context/ProposalContext";

export default function ProposalMetadata() {
  const { commonProps } = useContext(ProposalContext);

  return (
    <div className="my-4 rounded-md border bg-gray-100 px-4 py-5 sm:px-6">
      <h2 className="mb-3 text-gray-500">Metadata</h2>

      <div className="gaps-4">
        {commonProps.actions.length > 0 && (
          <>
            <p className="col-span-2 font-medium">Actions</p>

            <div className="col-span-2 mt-2 flex w-full flex-col space-y-2">
              {commonProps.actions.map((action, index) => (
                <ActionLabel
                  action={action}
                  space={commonProps.space}
                  key={index}
                />
              ))}
            </div>
          </>
        )}

        <div className="mt-2 grid grid-cols-3">
          {commonProps!.governanceCycle && (
            <>
              <span className="font-medium">Cycle</span>
              <span className="col-span-2">
                <Link
                  className="col-span-2"
                  href={`/s/${commonProps.space}/?cycle=${
                    commonProps!.governanceCycle
                  }`}
                >
                  {commonProps!.governanceCycle}
                  <ArrowTopRightOnSquareIcon className="inline h-3 w-3 text-xs" />
                </Link>
              </span>
            </>
          )}

          {commonProps!.snapshotSpace && commonProps!.snapshotHash && (
            <>
              <span className="font-medium">Snapshot</span>
              <a
                className="col-span-2"
                target="_blank"
                rel="noreferrer"
                href={`https://snapshot.org/#/${
                  commonProps!.snapshotSpace
                }/proposal/${commonProps!.snapshotHash}`}
              >
                {commonProps!.snapshotHash.substring(0, 8)}
                <ArrowTopRightOnSquareIcon className="inline h-3 w-3 text-xs" />
              </a>
            </>
          )}

          {commonProps!.discussion && (
            <>
              <span className="font-medium">Discussion:</span>
              <a
                className="col-span-2"
                target="_blank"
                rel="noreferrer"
                href={openInDiscord(commonProps!.discussion)}
              >
                {getDomain(commonProps!.discussion)}
                <ArrowTopRightOnSquareIcon className="inline h-3 w-3 text-xs" />
              </a>
            </>
          )}

          {!commonProps!.discussion && commonProps!.status === "Discussion" && (
            <>
              <span className="font-medium">Discussion:</span>
              <a
                target="_blank"
                rel="noreferrer"
                className="col-span-2 cursor-pointer text-sky-800"
                onClick={() => {
                  fetch(
                    `${NANCE_API_URL}/${
                      commonProps!.space
                    }/discussion/${commonProps?.uuid}`,
                  ).then((response) => {
                    response.json().then((data) => {
                      if (data.success) window.location.reload();
                    });
                  });
                }}
              >
                start discussion
                <ArrowTopRightOnSquareIcon className="inline h-3 w-3 text-xs" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getDomain(url: string) {
  // parse data between https:// and .<ending> to get name of domain, dont include www. or .<ending> in the name
  const domain = url.replace(/(https?:\/\/)?(www\.)?/i, "").split(".")[0];
  return domain;
}
