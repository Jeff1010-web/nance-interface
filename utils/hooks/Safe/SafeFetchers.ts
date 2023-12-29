import {
  SafeInfoResponse,
  SafeDelegatesResponse
} from "@/models/SafeTypes";
import { SafeMultisigTransactionListResponse } from "@safe-global/api-kit";
import { Fetcher } from "swr";

export function basicFetcher(): Fetcher<any, string> {
  return async (url) => {
    const res = await fetch(url);
    const json = await res.json();
    console.log(json);

    return json;
  };
}

export function jsonFetcher(): Fetcher<SafeMultisigTransactionListResponse, string> {
  return async (url) => {
    const res = await fetch(url);
    if (res.status == 400) {
      throw new Error("Invalid data.");
    } else if (res.status == 422) {
      throw new Error("Invalid ethereum address.");
    } else if (res.status == 404) {
      throw new Error("Safe not found.");
    }
    const json = await res.json();

    return json;
  };
}

export function safeInfoJsonFetcher(): Fetcher<SafeInfoResponse, string> {
  return async (url) => {
    const res = await fetch(url);
    if (res.status == 404) {
      throw new Error("Safe not found.");
    } else if (res.status == 422) {
      throw new Error("Safe address checksum not valid.");
    }
    const json = await res.json();

    return json;
  };
}

export function delegatesJsonFetcher(): Fetcher<SafeDelegatesResponse, string> {
  return async (url) => {
    const res = await fetch(url);
    if (res.status == 400) {
      throw new Error("Data not valid.");
    }
    const json = await res.json();

    return json;
  };
}

export async function fetchSafeWithAddress(url: string) {
  const res = await fetch(url);
  if (res.status !== 200) {
    return false;
  }
  const json = await res.json();
  return json.address !== undefined;
}

export function validSafeFetcher(): Fetcher<any, string> {
  return fetchSafeWithAddress;
}
