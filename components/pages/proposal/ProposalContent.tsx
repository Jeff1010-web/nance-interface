import { Disclosure } from "@headlessui/react";
import { ArrowUturnLeftIcon, ArrowTopRightOnSquareIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { format, toDate } from "date-fns";
import { BigNumber } from "ethers";
import Link from "next/link";
import { useContext, Fragment } from "react";
import { NANCE_API_URL } from "../../../constants/Nance";
import { numToPrettyString } from "../../../libs/NumberFormatter";
import { openInDiscord } from "../../../libs/discord";
import { canEditProposal, getLastSlash } from "../../../libs/nance";
import { Transfer, Payout, CustomTransaction, extractFunctionName, parseFunctionAbiWithNamedArgs, Reserve } from "../../../models/NanceTypes";
import { ProposalContext, ProposalCommonProps } from "../../../pages/s/[space]/[proposal]";
import FormattedAddress from "../../ethereum/FormattedAddress";
import MarkdownWithTOC from "../../MarkdownWithTOC";
import ResolvedContract from "../../ethereum/ResolvedContract";
import JBSplitEntryDetailed from "../../juicebox/JBSplitEntryDetailed";
import ProposalNavigator from "./ProposalNavigator";
import { CONTRACT_MAP } from "../../../constants/Contract";
import { payout2JBSplit } from "../../../libs/juicebox";
import JBSplitEntry from "../../juicebox/JBSplitEntry";

function getContractLabel(address: string) {
  if(CONTRACT_MAP.ETH === address) return "ETH";
  else if(CONTRACT_MAP.JBX === address) return "JBX";
  else if(CONTRACT_MAP.USDC === address) return "USDC";
  else return `Unknown(${address})`;
}

function getDomain(url: string) {
  // parse data between https:// and .<ending> to get name of domain, dont include www. or .<ending> in the name
  const domain = url.replace(/(https?:\/\/)?(www\.)?/i, '').split('.')[0];
  return domain;
}

export default function ProposalContent({ body }: { body: string }) {
  let { commonProps } = useContext(ProposalContext);
  commonProps = commonProps as ProposalCommonProps;

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

        {/* Metadata */}
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
                    <div key={index} className="ml-2 flex space-x-2 w-full break-words">
                      <span className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 h-min w-min">
                        {action.type}
                        {/* {action.type === "Reserve" && (
                          <span>
                            (Total: {(action.payload as Reserve).splits.reduce((acc, obj) => acc + obj.percent, 0) * 100 / JBConstants.TotalPercent.Splits[2]}%)
                          </span>
                        )} */}
                      </span>

                      {action.type === "Transfer" && (
                        <span className="line-clamp-5">
                          { numToPrettyString(Number((action.payload as Transfer).amount)) }
                          &nbsp;{getContractLabel((action.payload as Transfer).contract)}
                          &nbsp;to
                          <FormattedAddress address={(action.payload as Transfer).to} style="inline ml-1" />
                        </span>
                      )}

                      {action.type === "Payout" && (
                        <span className="line-clamp-5">
                          ${(action.payload as Payout).amountUSD.toLocaleString()}
                          &nbsp;to
                          <JBSplitEntry mod={payout2JBSplit(action.payload as Payout)} />
                          {/* <FormattedAddress address={(action.payload as Payout).address} style="inline ml-1" /> */}
                          {` for ${(action.payload as Payout).count} cycles`}
                        </span>
                      )}

                      {action.type === "Custom Transaction" && (
                        <span className="line-clamp-6">
                          <ResolvedContract address={(action.payload as CustomTransaction).contract} style="inline ml-1" />
                          &#46;
                          <a href={`https://etherfunk.io/address/${(action.payload as CustomTransaction).contract}?fn=${extractFunctionName((action.payload as CustomTransaction).functionName)}`} rel="noopener noreferrer" target="_blank" className="hover:underline inline">
                            {extractFunctionName((action.payload as CustomTransaction).functionName)}
                          </a>
                          
                          <span>{"("}</span>
                          <span>
                            {parseFunctionAbiWithNamedArgs((action.payload as CustomTransaction).functionName, (action.payload as CustomTransaction).args).map((pair: any, index: number) => (
                              <span key={index} className="ml-1 first:ml-0 after:content-[','] last:after:content-[''] text-gray-500 ">
                                <span className="inline-block">{pair[0]}</span>
                                <span>{`: ${pair[1]}`}</span>
                              </span>
                            ))}
                          </span>
                          <span>{")"}</span>

                          {BigNumber.from((action.payload as CustomTransaction).value).gt(0) && (
                            <span>
                              <span>{"{"}</span>
                              <span className="text-gray-500">value</span>
                              <span>{`: ${(action.payload as CustomTransaction).value}`}</span>
                              <span>{"}"}</span>
                            </span>
                          )}

                          <a href={`${NANCE_API_URL}/${commonProps?.space}/simulate/${action.uuid}`} className="ml-2">
                            <ArrowTopRightOnSquareIcon  className="h-4 w-4 inline" />
                          </a>

                        </span>
                      )}

                      {action.type === "Reserve" && (
                        <div className="flex flex-col">
                          {(action.payload as Reserve).splits.sort((a, b) => b.percent - a.percent).map(
                            (split, index) => (
                              <JBSplitEntryDetailed key={index} beneficiary={split.beneficiary} allocator={split.allocator} projectId={split.projectId.toString()} percent={split.percent.toString()} preferAddToBalance={split.preferAddToBalance} preferClaimed={split.preferClaimed} style="grid grid-cols-3 gap-6" />
                            )
                          )}
                        </div>
                      )}

                    </div>
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