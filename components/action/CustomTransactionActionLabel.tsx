import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { BigNumber } from "ethers";
import { NANCE_API_URL } from "../../constants/Nance";
import { CustomTransaction, extractFunctionName, parseFunctionAbiWithNamedArgs } from "../../models/NanceTypes";
import ResolvedContract from "../ethereum/ResolvedContract";

export default function CustomTransactionActionLabel({ customTransaction, space, uuid }: { customTransaction: CustomTransaction, space: string, uuid: string | undefined }) {
  return (
    <span className="line-clamp-6">
      <ResolvedContract address={customTransaction.contract} style="inline ml-1" />
      &#46;
      <a href={`https://etherfunk.io/address/${customTransaction.contract}?fn=${extractFunctionName(customTransaction.functionName)}`} rel="noopener noreferrer" target="_blank" className="hover:underline inline">
        {extractFunctionName(customTransaction.functionName)}
      </a>
      
      <span>{"("}</span>
      <span>
        {parseFunctionAbiWithNamedArgs(customTransaction.functionName, customTransaction.args).map((pair: any, index: number) => (
          <span key={index} className="ml-1 first:ml-0 after:content-[','] last:after:content-[''] text-gray-500 ">
            <span className="inline-block">{pair[0]}</span>
            <span>{`: ${pair[1]}`}</span>
          </span>
        ))}
      </span>
      <span>{")"}</span>

      {BigNumber.from(customTransaction.value).gt(0) && (
        <span>
          <span>{"{"}</span>
          <span className="text-gray-500">value</span>
          <span>{`: ${customTransaction.value}`}</span>
          <span>{"}"}</span>
        </span>
      )}

      <a href={`${NANCE_API_URL}/${space}/simulate/${uuid}`} className="ml-2">
        <ArrowTopRightOnSquareIcon  className="h-4 w-4 inline" />
      </a>

    </span>
  );
}