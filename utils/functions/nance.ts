import { EVENTS, NANCE_API_URL } from "@/constants/Nance";
import { DateEvent, Proposal, CustomTransactionArg } from "@nance/nance-sdk";
import { ONE_DAY_MILLISECONDS } from "@/constants/Nance";
import { Interface } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { v4 as uuidv4 } from "uuid";

export function getLastSlash(url: string | undefined): string {
  if (!url) return "";

  const split = url.split("/");
  return split[split.length - 1].trim();
}

export function urlOfUpload(space: string) {
  return `${NANCE_API_URL}/${space}/upload/`;
}

export function urlOfQuery(space: string, cycle: number | undefined) {
  return `${NANCE_API_URL}/${space}/query/${cycle ? `?cycle=${cycle}` : ""}`;
}

export function canEditProposal(status: string | undefined) {
  return [
    "Discussion",
    "Draft",
    "Temperature Check",
    "Archived",
    undefined,
  ].includes(status);
}

export const dateAtTime = (date: Date, time: string) => {
  const [hour, minute, seconds] = time.split(":");
  date.setUTCHours(Number(hour));
  date.setUTCMinutes(Number(minute));
  date.setUTCSeconds(Number(seconds));
  date.setUTCMilliseconds(0);
  return date;
};

export const getProposal = async (
  space: string,
  proposalId: string,
): Promise<Proposal> => {
  const json = await fetch(
    `${NANCE_API_URL}/${space}/proposal/${proposalId}`,
  ).then((res) => res.json());
  const proposal = json.data;
  return proposal;
};

export function extractFunctionName(str: string | null | undefined) {
  if (!str) return "";
  return str.split("(")[0].split(" ").slice(-1)[0];
}

export function parseFunctionAbiWithNamedArgs(
  functionAbi: string,
  args: any[],
) {
  if (!args) return [];

  let abi = functionAbi;
  // compatiable with old minimal format functionName
  if (!functionAbi.startsWith("function")) {
    abi = `function ${functionAbi}`;
  }

  const ethersInterface = new Interface([abi]);
  const paramNames = ethersInterface.fragments[0].inputs.map(
    (p) => p.name || "_",
  );
  let dict: any = [];
  Object.values(args).forEach((val, index) => {
    if (val.name && val.value && val.type) {
      // it's new struct
      const argStruct: CustomTransactionArg = val;
      if (val.type === "uint256") {
        dict.push([
          argStruct.name || "_",
          BigNumber.from(argStruct.value).toString(),
        ]);
      } else {
        dict.push([argStruct.name || "_", argStruct.value]);
      }
    } else {
      dict.push([paramNames[index] || "_", val]);
    }
  });

  return dict;
}

export function uuidGen(): string {
  return uuidv4().replaceAll('-', '');
}
