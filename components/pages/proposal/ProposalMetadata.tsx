import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { format, toDate } from "date-fns";
import { NANCE_API_URL } from "../../../constants/Nance";
import { openInDiscord } from "../../../libs/discord";
import { useContext } from "react";
import { ProposalContext } from "../../../pages/s/[space]/[proposal]";
import ActionLabel from "../../action/ActionLabel";
import Link from "next/link";

export default function ProposalMetadata() {
  const { commonProps } = useContext(ProposalContext);

  return (
    <div className="my-4 border bg-gray-100 rounded-md px-4 py-5 sm:px-6">
      <h2 className="text-gray-500 mb-3">
        Metadata
        <a href={`${NANCE_API_URL}/${commonProps.space}/proposal/${commonProps.uuid}`} className="ml-2">
          <ArrowTopRightOnSquareIcon className="h-4 w-4 inline" />
        </a>
      </h2>

      <div className="gaps-4">
        {commonProps.actions.length > 0 && (
          <>
            <p className="font-medium col-span-2">
              Actions
            </p>

            <div className="col-span-2 flex flex-col mt-2 w-full space-y-2">
              {commonProps.actions.map((action, index) => (
                <ActionLabel action={action} space={commonProps.space} key={index} />
              ))}
            </div>
          </>
        )}

        <div className="grid grid-cols-3 mt-2">
          {commonProps!.governanceCycle && (
            <>
              <span className="font-medium">Cycle</span>
              <span className="col-span-2">
                <Link className="col-span-2" href={`/s/${commonProps.space}/?cycle=${commonProps!.governanceCycle}`}>
                  {commonProps!.governanceCycle}
                  <ArrowTopRightOnSquareIcon className="h-3 w-3 inline text-xs" />
                </Link>

                ({format(toDate(commonProps!.created * 1000), "LLL dd, u KK:mm a")}
                {commonProps!.end > 0 && <span>- {format(toDate(commonProps!.end * 1000), "LLL dd, u KK:mm a")})</span>}
              </span>
            </>
          )}

          {commonProps!.snapshotSpace && commonProps!.snapshotHash && (
            <>
              <span className="font-medium">Snapshot</span>
              <a className="col-span-2" target="_blank" rel="noreferrer" href={`https://snapshot.org/#/${commonProps!.snapshotSpace}/proposal/${commonProps!.snapshotHash}`}>{commonProps!.snapshotHash.substring(0, 8)}<ArrowTopRightOnSquareIcon className="h-3 w-3 inline text-xs" /></a>
            </>
          )}

          {commonProps!.discussion && (
            <>
              <span className="font-medium">Discussion:</span>
              <a className="col-span-2" target="_blank" rel="noreferrer" href={openInDiscord(commonProps!.discussion)}>{getDomain(commonProps!.discussion)}<ArrowTopRightOnSquareIcon className="h-3 w-3 inline text-xs" /></a>
            </>
          )}

          {!commonProps!.discussion && commonProps!.status === 'Discussion' && (
            <>
              <span className="font-medium">Discussion:</span>
              <a target="_blank" rel="noreferrer" className="cursor-pointer text-sky-800 col-span-2" onClick={() => {
                fetch(`${NANCE_API_URL}/${commonProps!.space}/discussion/${commonProps?.uuid}`).then((response) => {
                  response.json().then((data) => {
                    if (data.success) window.location.reload();
                  });
                });
              }}>start discussion<ArrowTopRightOnSquareIcon className="h-3 w-3 inline text-xs" /></a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getDomain(url: string) {
  // parse data between https:// and .<ending> to get name of domain, dont include www. or .<ending> in the name
  const domain = url.replace(/(https?:\/\/)?(www\.)?/i, '').split('.')[0];
  return domain;
}
