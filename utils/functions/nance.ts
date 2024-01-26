import { EVENTS, NANCE_API_URL } from "@/constants/Nance";
import { APIResponse, SpaceInfo, ProposalsPacket, DateEvent } from '@/models/NanceTypes';
import { ONE_DAY_MILLISECONDS } from "@/constants/Nance";

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

export async function getNanceStaticPaths() {
  const spaces: APIResponse<SpaceInfo[]> = await fetch(`${NANCE_API_URL}/ish/all`).then(res => res.json());
  const paths = await Promise.all(spaces.data.flatMap(async (space) => {
    const allCycles = Array.from({ length: space.currentCycle }, (_, index) => index + 1).join(',');
    const proposalsResponse: APIResponse<ProposalsPacket> = await fetch(`${NANCE_API_URL}/${space.name}/proposals?cycle=${allCycles}`).then(res => res.json());
    if (proposalsResponse.success) {
      return proposalsResponse.data.proposals.map((proposal) => {
        return {
          params: {
            space: space.name,
            proposal: proposal.hash
          }
        };
      });
    };
    console.error(`bad response for ${space.name}`);
    return [];
  }));
  return paths.flat();
}

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
        start,
        end,
      },
      {
        title: event.title,
        start: new Date(start.getTime() + interval),
        end: new Date(end.getTime() + interval),
      }
    );
  });
  // sort by start date and remove events that have ended
  const nextEventsCleaned = nextEvents.sort((a, b) => {
    return a.start.getTime() - b.start.getTime();
  }).filter((event) => {
    return event.end.getTime() > inputDate.getTime();
  });
  return nextEventsCleaned;
};

export const getCurrentEvent = (events: DateEvent[], cycleStageLengths: number[], inputDate: Date) : DateEvent => {
  const nextEvents = getNextEvents(events, cycleStageLengths, inputDate);
  const currentEvent = nextEvents.find((event) => {
    return inputDate >= event.start && inputDate < event.end;
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
  const dayDelta = Math.floor((input.getTime() - currentEvent.start.getTime()) / ONE_DAY_MILLISECONDS);
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
