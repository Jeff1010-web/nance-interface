import { Disclosure } from "@headlessui/react";
import { ArrowTopRightOnSquareIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { format, toDate } from "date-fns";
import { NANCE_API_URL } from "../../../constants/Nance";
import { openInDiscord } from "../../../libs/discord";
import { getLastSlash } from "../../../libs/nance";
import { useContext } from "react";
import { ProposalContext } from "../../../pages/s/[space]/[proposal]";
import ActionLabel from "../../action/ActionLabel";

export default function ProposalMetadata() {
  const { commonProps } = useContext(ProposalContext);

  return (
    <div className="my-4 border bg-gray-100 rounded-md px-4 py-5 sm:px-6">
          <h2 className="text-gray-500 mb-3">
            Metadata 
            <a href={`${NANCE_API_URL}/${commonProps.space}/proposal/${commonProps.uuid}`} className="ml-2">
              <ArrowTopRightOnSquareIcon  className="h-4 w-4 inline" />
            </a>
          </h2>

          <div className="grid grid-cols-2 gaps-4">
            {commonProps.actions && (
              <>
                <p className="font-medium col-span-2">
                  Actions:
                  {commonProps.actions.length == 0 && (
                    <span className="ml-2 inline-flex items-center rounded-md bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800">
                      No action
                    </span>
                  )}
                </p>

                <div className="col-span-2 flex flex-col mt-2 w-full space-y-2">
                  {commonProps.actions.map((action, index) => (
                    <ActionLabel action={action} space={commonProps.space} key={index} />
                  ))}
                </div>
              </>
            )}
          </div>

          <Disclosure>
            {({ open }) => (
              /* Use the `open` state to conditionally change the direction of an icon. */
              <>
                <Disclosure.Button className="mt-4 mb-2 p-1 rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                  {open ? <ArrowsPointingInIcon className="h-5 w-5" /> : <ArrowsPointingOutIcon className="h-5 w-5" />}
                </Disclosure.Button>
                <Disclosure.Panel className="grid grid-cols-2 gaps-4" as="div">
                  {commonProps!.governanceCycle && (
                    <>
                      <span className="font-medium">Governance Cycle:</span>
                      <span>{commonProps!.governanceCycle}</span>
                    </>
                  )}

                  <span className="font-medium">Start date:</span>
                  <span>{format(toDate(commonProps!.created * 1000), "LLL dd, u KK:mm a")}</span>

                  {commonProps!.end > 0 && (
                    <>
                      <span className="font-medium">End date:</span>
                      <span>{format(toDate(commonProps!.end * 1000), "LLL dd, u KK:mm a")}</span>
                    </>
                  )}

                  {commonProps!.snapshotSpace && commonProps!.snapshotHash && (
                    <>
                      <span className="font-medium">Snapshot:</span>
                      <a target="_blank" rel="noreferrer" href={`https://snapshot.org/#/${commonProps!.snapshotSpace}/proposal/${commonProps!.snapshotHash}`}>{commonProps!.snapshotHash.substring(0, 8)}<ArrowTopRightOnSquareIcon className="h-3 w-3 inline text-xs" /></a>
                    </>
                  )}

                  {commonProps!.snapshot && (
                    <>
                      <span className="font-medium">Block:</span>
                      <a target="_blank" rel="noreferrer" href={`https://etherscan.io/block/${commonProps!.snapshot}`}>{commonProps!.snapshot}<ArrowTopRightOnSquareIcon className="h-3 w-3 inline text-xs" /></a>
                    </>
                  )}

                  {commonProps!.discussion && (
                    <>
                      <span className="font-medium">Discussion:</span>
                      <a target="_blank" rel="noreferrer" href={openInDiscord(commonProps!.discussion)}>{getDomain(commonProps!.discussion)}<ArrowTopRightOnSquareIcon className="h-3 w-3 inline text-xs" /></a>
                    </>
                  )}

                  {!commonProps!.discussion && commonProps!.status === 'Discussion' && (
                    <>
                      <span className="font-medium">Discussion:</span>
                      <a target="_blank" rel="noreferrer" className="cursor-pointer text-sky-800" onClick={() => {
                        fetch(`${NANCE_API_URL}/${commonProps!.space}/discussion/${commonProps?.uuid}`).then((response) => {
                          response.json().then((data) => {
                            if (data.success) window.location.reload();
                          });
                        });
                      }}>start discussion<ArrowTopRightOnSquareIcon className="h-3 w-3 inline text-xs" /></a>
                    </>
                  )}

                  {commonProps!.ipfs && (
                    <>
                      <span className="font-medium">IPFS:</span>
                      <a target="_blank" rel="noreferrer" href={`https://snapshot.mypinata.cloud/ipfs/${commonProps!.ipfs}`}>{getLastSlash(commonProps!.ipfs).slice(0,7)}<ArrowTopRightOnSquareIcon className="h-3 w-3 inline text-xs" /></a>
                    </>
                  )}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </div>
  )
}

function getDomain(url: string) {
  // parse data between https:// and .<ending> to get name of domain, dont include www. or .<ending> in the name
  const domain = url.replace(/(https?:\/\/)?(www\.)?/i, '').split('.')[0];
  return domain;
}