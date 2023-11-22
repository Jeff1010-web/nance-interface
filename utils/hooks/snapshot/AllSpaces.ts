import { SNAPSHOT_HUB } from "@/constants/Snapshot";
import { AllSpacesResponse } from "@/models/SnapshotTypes";

export async function fetchAllSpaces(): Promise<AllSpacesResponse> {
  return fetch(`${SNAPSHOT_HUB}/api/explore`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then(res => res.json()).then(json => json.spaces);
}