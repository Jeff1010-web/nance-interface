import { EVENTS, NANCE_API_URL } from "@/constants/Nance";
import { DateEvent, Proposal, CustomTransactionArg } from '@nance/nance-sdk';
import { ONE_DAY_MILLISECONDS } from "@/constants/Nance";
import { Interface } from "ethers/lib/utils";
import { BigNumber } from "ethers";

export function getLastSlash(url: string | undefined): string {
  if(!url) return "";

  const split = url.split('/');
  return split[split.length - 1].trim();
}

export function urlOfUpload(space: string) {
  return `${NANCE_API_URL}/${space}/upload/`;
}

export function urlOfQuery(space: string, cycle: number | undefined) {
  return `${NANCE_API_URL}/${space}/query/${(cycle ? `?cycle=${cycle}` : '')}`;
}

export function urlOfContent(space: string, hash: string) {
  return `${NANCE_API_URL}/${space}/markdown?hash=${hash}`;
}

export function canEditProposal(status: string | undefined) {
  return ([
    'Discussion',
    'Draft',
    'Temperature Check',
    'Private',
    'Archived',
    undefined,
  ].includes(status));
};

const cycleStageLengthsToInterval = (cycleStageLengths: number[]) => {
  const totalCycleDays = cycleStageLengths.reduce((a, b) => {
    return a + b;
  }, 0);
  return totalCycleDays * ONE_DAY_MILLISECONDS;
};

export const getNextEvents = (events: DateEvent[], cycleStageLengths: number[], inputDate: Date): DateEvent[] => {
  const interval = cycleStageLengthsToInterval(cycleStageLengths);
  const repeats = Math.floor((inputDate.getTime() - new Date(events[0].start).getTime()) / interval);
  const nextEvents: DateEvent[] = [];
  events.forEach((event) => {
    const originalStart = new Date(event.start);
    const originalEnd = new Date(event.end);
    const start = new Date(originalStart.getTime() + repeats * interval);
    const end = new Date(originalEnd.getTime() + repeats * interval);
    nextEvents.push(
      {
        title: event.title,
        start: start.toISOString(),
        end: end.toISOString(),
      },
      {
        title: event.title,
        start: new Date(start.getTime() + interval).toISOString(),
        end: new Date(end.getTime() + interval).toISOString(),
      }
    );
  });
  // sort by start date and remove events that have ended
  const nextEventsCleaned = nextEvents.sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  }).filter((event) => {
    return new Date(event.end).getTime() > inputDate.getTime();
  });
  return nextEventsCleaned;
};

export const getCurrentEvent = (events: DateEvent[], cycleStageLengths: number[], inputDate: Date) : DateEvent => {
  const nextEvents = getNextEvents(events, cycleStageLengths, inputDate);
  const currentEvent = nextEvents.find((event) => {
    return inputDate >= new Date(event.start) && inputDate < new Date(event.end);
  });
  return currentEvent as DateEvent;
};

export const getCycleStartDays = (cycleStageLengths: number[]) => {
  let accumulatedDays = 1;
  return cycleStageLengths.map((_, index, array) => {
    if (index === 0) return 1;
    accumulatedDays += array[index - 1];
    return accumulatedDays;
  });
};

export const getCurrentGovernanceCycleDay = (currentEvent: DateEvent, cycleStageLengths: number[], input: Date) => {
  if (!currentEvent) return 0;
  const cycleStartDays = getCycleStartDays(cycleStageLengths);
  const eventIndex = Object.values(EVENTS).indexOf(currentEvent.title);
  const dayDelta = Math.floor((input.getTime() - new Date(currentEvent.start).getTime()) / ONE_DAY_MILLISECONDS);
  const currentGovernanceCycleDay = cycleStartDays[eventIndex] + dayDelta;
  return currentGovernanceCycleDay;
};

export const dateAtTime = (date: Date, time: string) => {
  const [hour, minute, seconds] = time.split(':');
  date.setUTCHours(Number(hour));
  date.setUTCMinutes(Number(minute));
  date.setUTCSeconds(Number(seconds));
  date.setUTCMilliseconds(0);
  return date;
};

export const getProposal = async (space: string, proposalId: string): Promise<Proposal> => {
  const json = await fetch(`${NANCE_API_URL}/${space}/proposal/${proposalId}`).then(res => res.json());
  const proposal = json.data;
  return proposal;
};

export function extractFunctionName(str: string) {
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