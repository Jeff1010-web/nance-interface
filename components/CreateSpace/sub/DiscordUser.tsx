import { PropsWithChildren, useEffect, useState } from "react";
import { LOCAL_STORAGE_KEY_DISCORD_STATUS } from "@/utils/functions/discordURL";
import {
  useFetchDiscordUser,
  useLogoutDiscordUser,
} from "@/utils/hooks/DiscordHooks";
import { avatarBaseUrl } from "@/constants/Discord";
import { discordAuthWindow } from "@/utils/functions/discord";
import Image from "next/image";

interface DiscordUserProps {
  address: string;
}

export default function DiscordUser({ address, children }: PropsWithChildren<DiscordUserProps>) {
  // state
  const [shouldFetchDiscordUser, setShouldFetchDiscordUser] = useState(false);

  const { data: discordUser, isLoading: discordLoading, mutate } = useFetchDiscordUser(
    { address },
    shouldFetchDiscordUser,
  );

  const { trigger: discordLogoutTrigger } = useLogoutDiscordUser(
    { address },
    !!discordUser,
  );

  useEffect(() => {
    // check if there is a recent LOCAL_STORAGE_KEY_DISCORD_STATUS we can use
    const discordStatus = localStorage.getItem(
      LOCAL_STORAGE_KEY_DISCORD_STATUS,
    );
    if (discordStatus === "success") setShouldFetchDiscordUser(true);
    function handleStorageChange(event: StorageEvent) {
      if (event.key === LOCAL_STORAGE_KEY_DISCORD_STATUS) {
        if (event.newValue === "success") setShouldFetchDiscordUser(true);
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <>
      {!discordUser?.username && !discordLoading && (
        <button
          className="inline-flex w-fit items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-black disabled:opacity-50"
          onClick={() => {
            localStorage.removeItem(LOCAL_STORAGE_KEY_DISCORD_STATUS);
            discordAuthWindow();
          }}
        >
          Connect Discord
        </button>
      )}
      <div className="flex justify-left">
        {discordLoading && (
          <div
            className="inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-current border-t-transparent text-blue-600"
            role="status"
            aria-label="loading"
          ></div>
        )}
      </div>
      {!discordLoading && discordUser?.avatar && (
        <>
          <div>
            <div className="block mb-1">
              <p className="">{`${discordUser?.username}`}</p>
              <a
                className="text-xs underline hover:cursor-pointer"
                onClick={() => {
                  discordLogoutTrigger();
                  // set local storage to false, then refresh
                  localStorage.removeItem(LOCAL_STORAGE_KEY_DISCORD_STATUS);
                  mutate();
                  setShouldFetchDiscordUser(false);
                }}
              >
                disconnect
              </a>
            </div>
            <Image
              className="overflow-hidden rounded-full"
              src={`${avatarBaseUrl}/${discordUser?.id}/${discordUser?.avatar}.png`}
              alt={discordUser?.username || ""}
              width={50}
              height={50}
            />
          </div>

          {children}
        </>
      )}
    </>
  );
}
