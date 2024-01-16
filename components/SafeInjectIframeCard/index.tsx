import { useState } from "react";
import { useSafeInject } from "./context/SafeInjectedContext";
import { useDebounce } from "@/utils/hooks/UseDebounce";
import { isAddress } from "viem";
import GenericListbox from "../common/GenericListbox";

const dAppList = [
  {
    id: "https://juicebox.money",
    name: "Juicebox",
  },
  {
    id: "https://app.uniswap.org",
    name: "Uniswap",
  },
  {
    id: "https://jokerace.xyz",
    name: "Jokerace",
  },
];

export default function SafeInjectIframeCard() {
  const { appUrl, iframeRef, address, setAppUrl } = useSafeInject();
  const [urlInput, setUrlInput] = useState<string>("");

  useDebounce<string | undefined>(urlInput, 500, (k: string | undefined) => {
    if (k !== appUrl) {
      setAppUrl(k);
    }
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {"Input app url you want to load"}
      </label>
      <p className="text-xs text-gray-500">
        {
          "You can visit any dApps that supports Safe, interact with interface and get transaction you need to sign here."
        }
      </p>
      <div className="mt-1 flex flex-col gap-2 md:flex-row">
        <input
          type="text"
          className="block h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm md:w-2/3"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          disabled={!isAddress(address || "")}
          placeholder={
            isAddress(address || "")
              ? "Input app url you want to load"
              : "No project owner address founded"
          }
        />

        <div className="md:1/3">
          <GenericListbox
            label=""
            items={dAppList}
            value={
              dAppList.find((v) => v.id === appUrl) || {
                id: "",
                name: "-- Select dApp --",
              }
            }
            onChange={(v) => {
              setUrlInput(v.id);
              setAppUrl(v.id);
            }}
            disabled={!isAddress(address || "")}
          />
        </div>
      </div>

      {appUrl && (
        <div className="mt-2 overflow-y-auto">
          <iframe
            ref={iframeRef}
            src={appUrl}
            className="h-[60vh] w-full p-2"
          />
        </div>
      )}
    </div>
  );
}
