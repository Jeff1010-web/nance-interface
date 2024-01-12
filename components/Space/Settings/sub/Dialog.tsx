import { SpaceConfig } from "@/models/NanceTypes";
import { useSession } from "next-auth/react";
import ConnectWalletButton from "@/components/common/ConnectWalletButton";
import DiscordUser from "@/components/CreateSpace/sub/DiscordUser";
import { DiscordForm } from "@/components/CreateSpace";

export default function Dialog({ edit }: { spaceConfig: SpaceConfig; edit?: boolean }) {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col">
      {session ? (
        <>
          <DiscordUser address={session.user?.name || ""} />
          <DiscordForm disabled={!edit} />
        </>
      ) : (
        <div className="flex flex-col">
          <ConnectWalletButton />
        </div>
      )}
    </div>
  );
}
