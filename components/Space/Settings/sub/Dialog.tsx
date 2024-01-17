import { SpaceConfig } from "@/models/NanceTypes";
import { useSession } from "next-auth/react";
import ConnectWalletButton from "@/components/common/ConnectWalletButton";
import DiscordUser from "@/components/CreateSpace/sub/DiscordUser";
import { DiscordForm } from "@/components/CreateSpace";

export default function Dialog({ spaceConfig, edit }: { spaceConfig: SpaceConfig; edit?: boolean }) {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col">
      {session ? (
        <div>
          <DiscordUser address={session.user?.name || ""} />
          {session && spaceConfig.spaceOwners.includes(session.user?.name || "") ? (
            <DiscordForm disabled={!edit} />
          ) : (
            <p className="mt-1 text-sm font-medium text-gray-900">You are not an owner of this space.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col">
          <ConnectWalletButton />
        </div>
      )}
    </div>
  );
}
