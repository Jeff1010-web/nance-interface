import {
  useFetchDiscordUser,
  useLogoutDiscordUser,
} from "@/utils/hooks/DiscordHooks";
import { avatarBaseUrl } from "@/constants/Discord";
import { discordAuthWindow } from "@/utils/functions/discord";
import Image from "next/image";
import { DiscordConnectButton } from "./DiscordConnectButton";

/**
 * Display the discord user profile, or a button to connect to discord.
 */
export default function DiscordUserProfile({ address }: { address: string }) {
  const { data: discordUser, isLoading } = useFetchDiscordUser(
    { address },
    !!address,
  );

  const { trigger: discordLogoutTrigger } = useLogoutDiscordUser(
    { address },
    !!discordUser,
  );

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div
          className="inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-current border-t-transparent text-blue-600"
          role="status"
          aria-label="loading"
        ></div>
      </div>
    );
  }

  if (!discordUser) {
    return (
      <div className="flex justify-center">
        <DiscordConnectButton />
      </div>
    );
  }

  const { id: userId, username, avatar } = discordUser;

  return (
    <div className="flex justify-center">
      <div className="block text-center">
        <p className="">{`${discordUser?.username}`}</p>
        <a
          className="text-xs underline hover:cursor-pointer"
          onClick={() => {
            discordLogoutTrigger();
          }}
        >
          disconnect
        </a>
      </div>
      <Image
        className="ml-4 overflow-hidden rounded-full"
        src={`${avatarBaseUrl}/${userId}/${avatar}.png`}
        alt={username || ""}
        width={50}
        height={50}
      />
    </div>
  );
}
