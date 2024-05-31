import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { NANCE_API_URL } from "@/constants/Nance";
import { openInDiscord } from "@/utils/functions/discord";
import { useContext, useState } from "react";
import Link from "next/link";
import ActionLabel from "@/components/ActionLabel/ActionLabel";
import { ProposalContext } from "./context/ProposalContext";
import { useSpaceInfo } from "@/utils/hooks/NanceHooks";
import { SpaceContext } from "@/context/SpaceContext";
import { Spinner } from "flowbite-react";
import { APIResponse, ProposalPacket } from "@nance/nance-sdk";
import toast from "react-hot-toast";

export default function ProposalMetadata() {
  const { commonProps } = useContext(ProposalContext);
  const shouldFetchSpaceInfo = commonProps?.actions?.length > 0;
  const { data } = useSpaceInfo({ space: commonProps.space}, shouldFetchSpaceInfo);

  // refresh discussion link
  const [discussionThreadURL, setDiscussionThreadURL] = useState<string | undefined>(commonProps.discussion);

  // set interval to refresh discussion link, couldn't get it to work with useProposal hook
  let retries = 0;
  const retryLimit = 2;
  const interval = setInterval(async () => {
    if (!discussionThreadURL) {
      if (retries >= retryLimit) {
        setDiscussionThreadURL("ERROR");
        clearInterval(interval);
      }
      try {
        console.log(`retry ${retries}`);
        console.log(discussionThreadURL);
        const res = await fetch(`${NANCE_API_URL}/${commonProps.space}/proposal/${commonProps.uuid}`);
        const { data } = await res.json() as APIResponse<ProposalPacket>;
        const refreshedDiscussionURL = data?.discussionThreadURL;
        if (refreshedDiscussionURL !== "" && refreshedDiscussionURL !== undefined) {
          setDiscussionThreadURL(refreshedDiscussionURL);
          clearInterval(interval);
        }
      } catch (e) {
        console.error(e);
      } finally {
        retries += 1;
      }
    }
  }, 1500);

  return (
    <div className="my-4 rounded-md border bg-gray-100 px-4 py-5 sm:px-6">
      <Link
        href={`${NANCE_API_URL}/${commonProps.space}/proposal/${commonProps.uuid}`}
        className="mb-3 text-gray-500">
          Metadata
      </Link>
      <div className="gaps-4">
        {commonProps.actions && commonProps.actions.length > 0 && (
          <>
            <p className="col-span-2 font-medium">Actions:</p>

            <div className="col-span-2 mt-2 flex w-full flex-col space-y-2">
              <SpaceContext.Provider value={data?.data}>
                {commonProps.actions.map((action, index) => (
                  <ActionLabel
                    action={action}
                    space={commonProps.space}
                    key={index}
                  />
                ))}
              </SpaceContext.Provider>
            </div>
          </>
        )}

        <div className="mt-2 grid grid-cols-3">
          {commonProps.governanceCycle && (
            <>
              <span className="font-medium">Cycle:</span>
              <span className="col-span-2">
                <Link
                  className="col-span-2"
                  href={`/s/${commonProps.space}/?cycle=${
                    commonProps.governanceCycle
                  }`}
                >
                  {commonProps.governanceCycle}
                  <ArrowTopRightOnSquareIcon className="inline h-3 w-3 text-xs" />
                </Link>
              </span>
            </>
          )}

          {!discussionThreadURL && commonProps.status === "Discussion" && (
            <>
              <span className="font-medium">Discussion:</span>
              <Spinner size={"sm"}/>
            </>
          )}

          {discussionThreadURL && discussionThreadURL !== "ERROR" && (
            <>
              <span className="font-medium">Discussion:</span>
              <a
                className="col-span-2 w-fit"
                target="_blank"
                rel="noreferrer"
                href={openInDiscord(discussionThreadURL)}
              >
                {getDomain(discussionThreadURL)}
                <ArrowTopRightOnSquareIcon className="inline h-3 w-3 text-xs" />
              </a>
            </>
          )}

          {discussionThreadURL === "ERROR" && (
            <>
              <span className="font-medium">Discussion:</span>
              <a
                target="_blank"
                rel="noreferrer"
                className="col-span-2 cursor-pointer text-sky-800"
                onClick={async () => {
                  try {
                    setDiscussionThreadURL(undefined);
                    await fetch(
                      `${NANCE_API_URL}/${
                        commonProps!.space
                      }/discussion/${commonProps?.uuid}`,
                    );
                  } catch (e: any) {
                    toast.error(e.toString());
                  }
                }}
              >
                start discussion
                <ArrowTopRightOnSquareIcon className="inline h-3 w-3 text-xs" />
              </a>
            </>
          )}

          {commonProps.snapshotSpace && commonProps.snapshotHash && (
            <>
              <span className="font-medium">Snapshot view:</span>
              <a
                className="col-span-2 w-fit"
                target="_blank"
                rel="noreferrer"
                href={`https://snapshot.org/#/${
                  commonProps.snapshotSpace
                }/proposal/${commonProps.snapshotHash}`}
              >
                {commonProps.snapshotHash.substring(0, 8)}
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
