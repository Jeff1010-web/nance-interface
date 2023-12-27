import { PropsWithChildren, useEffect, useState } from "react";
import { LOCAL_STORAGE_KEY_DISCORD_STATUS } from "@/utils/functions/discordURL";
import {
  useFetchDiscordUser,
  useLogoutDiscordUser,
} from "@/utils/hooks/DiscordHooks";
import { avatarBaseUrl } from "@/constants/Discord";
import { discordAuthWindow } from "@/utils/functions/discord";
import BasicFormattedCard from "@/components/common/BasicFormattedCard";

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
          onClick={async () => {
            localStorage.removeItem(LOCAL_STORAGE_KEY_DISCORD_STATUS);
            const init = await fetch("/api/discord/init");
            const { csrf, address } = await init.json();
            discordAuthWindow(csrf, address);
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
            <BasicFormattedCard
              imgSrc={`${avatarBaseUrl}/${discordUser?.id}/${discordUser.avatar}.png`}
              imgAlt={`Avatar of ${discordUser.username}`}
              action={() => {
                discordLogoutTrigger();
                // set local storage to false
                localStorage.removeItem(LOCAL_STORAGE_KEY_DISCORD_STATUS);
                mutate();
                setShouldFetchDiscordUser(false);
              }}
            >
              <div className="inline-flex items-center">
                <DiscordLogo />
                <div className="pl-1 text-sm font-semibold text-gray-900">
                @{discordUser?.username}
                </div>
              </div>
            </BasicFormattedCard>
          </div>

          {children}
        </>
      )}
    </>
  );
}

const DiscordLogo = () => (
  <div className="h-8 w-8 pt-1">
    <svg fill="#3949ab" viewBox="0 0 24 24">
      <path transform="scale(1.25,1.25)"
        fillRule="evenodd"
        d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"
        clipRule="evenodd"
      />
    </svg>
  </div>
);
