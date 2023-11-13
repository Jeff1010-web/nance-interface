import CONFIG from "./Config";

export const SNAPSHOT_HUB = "https://hub.snapshot.org";
export const SNAPSHOT_HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": CONFIG.snapshot.apiKey,
};
